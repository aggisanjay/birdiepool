
// src/app/api/draws/[id]/execute/route.ts
import { NextRequest } from 'next/server';
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server';
import { generateRandomDraw } from '@/lib/draw-engine/random';
import { generateAlgorithmicDraw } from '@/lib/draw-engine/algorithmic';
import { processDrawEntries } from '@/lib/draw-engine/matcher';
import { calculatePrizeDistribution } from '@/lib/draw-engine/prize-calculator';
import {
  handleApiError,
  UnauthorizedError,
  ForbiddenError,
  ValidationError,
  NotFoundError,
} from '@/lib/utils/errors';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new UnauthorizedError();

    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') throw new ForbiddenError();

    const adminSupabase = createAdminSupabaseClient();

    // Get the draw
    const { data: draw } = await adminSupabase
      .from('draws').select('*').eq('id', params.id).single();
    if (!draw) throw new NotFoundError('Draw not found');

    if (!['draft', 'simulated'].includes(draw.status)) {
      throw new ValidationError('Draw can only be executed from draft or simulated status');
    }

    // ✅ FIX: Only wipe entries & winners when re-simulating from 'simulated' status.
    // If the draw is still in 'draft', no prior data exists to protect.
    // This prevents accidentally deleting proof uploads or verification progress
    // if an admin re-runs the simulation after winners have already uploaded proofs.
    if (draw.status === 'simulated') {
      // Check if any winner has already uploaded proof or been verified — block re-simulation
      const { data: progressedWinners } = await adminSupabase
        .from('winners')
        .select('id')
        .eq('draw_id', params.id)
        .or('proof_image_url.not.is.null,verification_status.neq.pending')
        .limit(1);

      if (progressedWinners && progressedWinners.length > 0) {
        throw new ValidationError(
          'Cannot re-simulate: one or more winners have already uploaded proof or been verified. Publish the draw instead.'
        );
      }
    }

    // Safe to delete previous simulation data
    await adminSupabase
      .from('draw_entries').delete().eq('draw_id', params.id);
    await adminSupabase
      .from('winners').delete().eq('draw_id', params.id);

    // Get eligible users with their scores
    const { data: eligibleUsers } = await adminSupabase
      .rpc('get_draw_eligible_users');

    if (!eligibleUsers || eligibleUsers.length === 0) {
      throw new ValidationError('No eligible participants for this draw');
    }

    // ✅ Ensure scores are integers not strings
    const cleanEligibleUsers = eligibleUsers.map((u: Record<string, unknown>) => ({
      user_id: u.user_id,
      scores: (u.scores as unknown[]).map(Number),
    }));

    // Generate draw numbers
    const rawDrawNumbers = draw.mode === 'algorithmic'
      ? generateAlgorithmicDraw(cleanEligibleUsers.map((u) => u.scores))
      : generateRandomDraw();

    // ✅ Ensure draw numbers are integers
    const drawNumbers = rawDrawNumbers.map(Number);

    // Insert draw entries with integer scores
    const entries = cleanEligibleUsers.map((u) => ({
      draw_id: draw.id,
      user_id: u.user_id,
      scores: u.scores,  // already integers from cleanEligibleUsers
    }));

    const { data: insertedEntries, error: entriesError } = await adminSupabase
      .from('draw_entries').insert(entries).select();
    if (entriesError) throw entriesError;

    // Process matching — integer vs integer comparison
    const results = processDrawEntries(drawNumbers, insertedEntries!.map((e) => ({
      id: e.id,
      user_id: e.user_id,
      scores: (e.scores as unknown[]).map(Number),  // ✅ cast to integers
    })));

    // Update each entry with its match results
    for (const entry of insertedEntries!) {
      const drawSet = new Set(drawNumbers);
      const entryScores = (entry.scores as unknown[]).map(Number);
      const matched = entryScores.filter((s: number) => drawSet.has(s));

      await adminSupabase
        .from('draw_entries')
        .update({
          matched_numbers: matched,
          match_count: matched.length,
        })
        .eq('id', entry.id);
    }

    // ✅ Calculate prizes AFTER knowing exact winner counts
    const match5Count = results.match5Winners.length;
    const match4Count = results.match4Winners.length;
    const match3Count = results.match3Winners.length;

    const prizeDistribution = calculatePrizeDistribution(
      draw.total_pool_cents,
      draw.rollover_cents,
      match5Count,
      match4Count,
      match3Count,
    );

    // ✅ Log prize amounts for debugging
    console.log('Prize Distribution:', {
      totalPool: draw.total_pool_cents,
      rollover: draw.rollover_cents,
      match5Count,
      match4Count,
      match3Count,
      match5PrizePerWinner: prizeDistribution.match5PrizePerWinner,
      match4PrizePerWinner: prizeDistribution.match4PrizePerWinner,
      match3PrizePerWinner: prizeDistribution.match3PrizePerWinner,
    });

    // Build winner records with correct prize amounts
    const winnerRecords = [
      ...results.match5Winners.map((w) => ({
        draw_id: draw.id,
        draw_entry_id: w.entryId,
        user_id: w.userId,
        match_type: 'match_5',
        matched_numbers: w.matchResult.matchedNumbers,
        prize_amount_cents: prizeDistribution.match5PrizePerWinner,  // ✅ correct value
      })),
      ...results.match4Winners.map((w) => ({
        draw_id: draw.id,
        draw_entry_id: w.entryId,
        user_id: w.userId,
        match_type: 'match_4',
        matched_numbers: w.matchResult.matchedNumbers,
        prize_amount_cents: prizeDistribution.match4PrizePerWinner,  // ✅ correct value
      })),
      ...results.match3Winners.map((w) => ({
        draw_id: draw.id,
        draw_entry_id: w.entryId,
        user_id: w.userId,
        match_type: 'match_3',
        matched_numbers: w.matchResult.matchedNumbers,
        prize_amount_cents: prizeDistribution.match3PrizePerWinner,  // ✅ correct value
      })),
    ];

    if (winnerRecords.length > 0) {
      const { error: winnersError } = await adminSupabase
        .from('winners').insert(winnerRecords);
      if (winnersError) throw winnersError;
    }

    // Update the draw record
    const { data: updatedDraw, error: updateError } = await adminSupabase
      .from('draws')
      .update({
        numbers: drawNumbers,               // ✅ integers
        status: 'simulated' as never,
        executed_at: new Date().toISOString(),
        eligible_participants: eligibleUsers.length,
        match_5_count: match5Count,
        match_4_count: match4Count,
        match_3_count: match3Count,
        simulation_results: {
          drawNumbers,
          totalEntries: results.totalEntries,
          match5Winners: match5Count,
          match4Winners: match4Count,
          match3Winners: match3Count,
          prizeDistribution,
        },
      })
      .eq('id', draw.id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Audit log
    await adminSupabase.from('audit_log').insert({
      actor_id: user.id,
      action: 'draw_executed',
      entity_type: 'draw',
      entity_id: draw.id,
      metadata: {
        numbers: drawNumbers,
        winners: winnerRecords.length,
        rollover: prizeDistribution.rolloverAmount,
      },
    });

    return Response.json({
      draw: updatedDraw,
      results: {
        drawNumbers,
        totalEntries: results.totalEntries,
        match5Winners: match5Count,
        match4Winners: match4Count,
        match3Winners: match3Count,
        prizeDistribution,
      },
    });
  } catch (error) { return handleApiError(error); }
}
