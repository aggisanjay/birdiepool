// import { NextRequest } from 'next/server';
// import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server';
// import { verifyWinnerSchema } from '@/lib/utils/validators';
// import { handleApiError, UnauthorizedError, ForbiddenError, NotFoundError, ValidationError } from '@/lib/utils/errors';

// // POST /api/winners/[id]/proof  -- upload proof image
// export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     const supabase = createServerSupabaseClient();
//     const { data: { user } } = await supabase.auth.getUser();
//     if (!user) throw new UnauthorizedError();

//     const { data: winner } = await supabase.from('winners').select('id, user_id, verification_status').eq('id', params.id).eq('user_id', user.id).single() as any;
//     if (!winner) throw new NotFoundError('Winner record not found');
//     if (winner.verification_status !== 'pending') throw new ValidationError('Proof can only be uploaded for pending verifications');

//     const formData = await request.formData();
//     const file = formData.get('proof') as File;
//     if (!file) throw new ValidationError('No file provided');

//     const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
//     if (!allowedTypes.includes(file.type)) throw new ValidationError('File must be an image (JPEG, PNG, WebP, or GIF)');
//     if (file.size > 10 * 1024 * 1024) throw new ValidationError('File must be less than 10MB');

//     const fileExt = file.name.split('.').pop();
//     const fileName = `${user.id}/${params.id}/proof.${fileExt}`;
//     const adminSupabase = createAdminSupabaseClient();

//     const { data: uploadData, error: uploadError } = await adminSupabase.storage.from('winner-proofs').upload(fileName, file, { contentType: file.type, upsert: true });
//     if (uploadError) throw uploadError;

//     const { data: urlData } = adminSupabase.storage.from('winner-proofs').getPublicUrl(uploadData.path);
//     const { data: updatedWinner, error } = await adminSupabase.from('winners').update({ proof_image_url: urlData.publicUrl, proof_uploaded_at: new Date().toISOString() }).eq('id', params.id).select().single() as any;
//     if (error) throw error;
//     return Response.json({ winner: updatedWinner });
//   } catch (error) { return handleApiError(error); }
// }

// src/app/api/winners/[id]/proof/route.ts
import { NextRequest } from 'next/server';
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server';
import {
  handleApiError,
  UnauthorizedError,
  NotFoundError,
  ValidationError,
} from '@/lib/utils/errors';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new UnauthorizedError();

    // Verify this winner belongs to the logged-in user
    const { data: winner } = await supabase
      .from('winners')
      .select('id, user_id, verification_status, proof_image_url')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (!winner) throw new NotFoundError('Winner record not found');

    if (winner.verification_status !== 'pending') {
      throw new ValidationError('Proof can only be uploaded for pending verifications');
    }

    // Parse the form data
    const formData = await request.formData();
    const file = formData.get('proof') as File | null;

    if (!file) throw new ValidationError('No file provided');

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      throw new ValidationError('File must be an image (JPEG, PNG, WebP, or GIF)');
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      throw new ValidationError('File must be less than 10MB');
    }

    // Build file path: userId/winnerId/proof.ext
    const fileExt = file.name.split('.').pop() ?? 'jpg';
    const filePath = `${user.id}/${params.id}/proof.${fileExt}`;

    const adminSupabase = createAdminSupabaseClient();

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await adminSupabase
      .storage
      .from('winner-proofs')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: true,  // overwrite if re-uploading
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get the public URL
    const { data: urlData } = adminSupabase
      .storage
      .from('winner-proofs')
      .getPublicUrl(uploadData.path);

    // Update winner record with proof URL and timestamp
    const { data: updatedWinner, error: updateError } = await adminSupabase
      .from('winners')
      .update({
        proof_image_url: urlData.publicUrl,
        proof_uploaded_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) throw updateError;

    return Response.json({ 
      success: true, 
      winner: updatedWinner,
      proof_url: urlData.publicUrl,
    });

  } catch (error) { return handleApiError(error); }
}
