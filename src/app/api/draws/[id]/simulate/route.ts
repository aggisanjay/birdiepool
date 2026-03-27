import { NextRequest } from 'next/server';
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server';
import { generateRandomDraw } from '@/lib/draw-engine/random';
import { generateAlgorithmicDraw } from '@/lib/draw-engine/algorithmic';
import { matchScores } from '@/lib/draw-engine/matcher';
import { calculatePrizeDistribution } from '@/lib/draw-engine/prize-calculator';
import { handleApiError, UnauthorizedError, ForbiddenError, NotFoundError } from '@/lib/utils/errors';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new UnauthorizedError();
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') throw new ForbiddenError();

    const adminSupabase = createAdminSupabaseClient();
    const { data: draw } = await adminSupabase.from('draws').select('*').eq('id', params.id).single();
    if (!draw) throw new NotFoundError('Draw not found');

    const { data: eligibleUsers } = await adminSupabase.rpc('get_draw_eligible_users');
    if (!eligibleUsers || eligibleUsers.length === 0) return Response.json({ simulation: { drawNumbers: [], totalEligible: 0, message: 'No eligible participants' } });

    const body = await request.json().catch(() => ({}));
    const iterations = Math.min(body.iterations ?? 1, 100);
    const simulations = [];

    for (let i = 0; i < iterations; i++) {
      const drawNumbers = draw.mode === 'algorithmic'
        ? generateAlgorithmicDraw(eligibleUsers.map((u: Record<string, unknown>) => u.scores as number[]))
        : generateRandomDraw();
      let match5 = 0, match4 = 0, match3 = 0;
      for (const u of eligibleUsers) {
        const result = matchScores(u.scores as number[], drawNumbers);
        if (result.matchType === 'match_5') match5++;
        else if (result.matchType === 'match_4') match4++;
        else if (result.matchType === 'match_3') match3++;
      }
      simulations.push({ drawNumbers, match5Winners: match5, match4Winners: match4, match3Winners: match3, prizeDistribution: calculatePrizeDistribution(draw.total_pool_cents, draw.rollover_cents, match5, match4, match3) });
    }

    return Response.json({
      simulation: {
        iterations, totalEligible: eligibleUsers.length, drawMode: draw.mode,
        totalPoolCents: draw.total_pool_cents, rolloverCents: draw.rollover_cents,
        averages: {
          match5Winners: simulations.reduce((s, sim) => s + sim.match5Winners, 0) / iterations,
          match4Winners: simulations.reduce((s, sim) => s + sim.match4Winners, 0) / iterations,
          match3Winners: simulations.reduce((s, sim) => s + sim.match3Winners, 0) / iterations,
        },
        simulations: simulations.slice(0, 10),
      },
    });
  } catch (error) { return handleApiError(error); }
}
