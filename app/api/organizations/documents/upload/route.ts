import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { handleError } from '@/lib/supabase/helpers';
import { toCamelCase } from '@/lib/supabase/transform';
import { requireAuth } from '@/lib/auth/middleware';

export async function POST(req: Request) {
  try {
    const auth = await requireAuth();
    if ('status' in auth) return auth;

    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string || 'other';
    const organizationId = formData.get('organizationId') as string;

    if (!file || !organizationId) {
      return NextResponse.json({ error: 'File and organizationId are required' }, { status: 400 });
    }

    const validTypes = ['business_license', 'tax_certificate', 'authorization_letter', 'contract', 'other'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'Invalid document type' }, { status: 400 });
    }

    // Verify user belongs to this organization
    const { data: member } = await supabase
      .from('organization_members')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('user_id', auth.user.userId)
      .single();

    if (!member && auth.user.role !== 'admin') {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const filePath = `${organizationId}/${type}/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('partner-legal-docs')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      // If bucket doesn't exist, create a public bucket
      if (uploadError.message?.includes('bucket') || uploadError.message?.includes('not found')) {
        const { error: bucketError } = await supabase.storage.createBucket('partner-legal-docs', {
          public: true,
          fileSizeLimit: 10485760, // 10MB
        });
        if (bucketError) return NextResponse.json({ error: 'Storage bucket error: ' + bucketError.message }, { status: 500 });

        const { error: retryError } = await supabase.storage
          .from('partner-legal-docs')
          .upload(filePath, buffer, { contentType: file.type, upsert: true });
        if (retryError) return NextResponse.json({ error: 'Upload failed: ' + retryError.message }, { status: 500 });
      } else {
        return NextResponse.json({ error: 'Upload failed: ' + uploadError.message }, { status: 500 });
      }
    }

    // Get public URL
    const { data: urlData } = await supabase.storage
      .from('partner-legal-docs')
      .getPublicUrl(filePath);

    const now = new Date().toISOString();
    const docId = `DOC_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const { data: doc, error: dbError } = await supabase.from('partner_documents').insert({
      id: docId,
      organization_id: organizationId,
      type,
      file_url: urlData?.publicUrl || filePath,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
      uploaded_by: auth.user.userId,
      uploaded_at: now,
      status: 'pending',
    }).select().single();

    if (dbError) return handleError(dbError);
    return NextResponse.json(toCamelCase(doc));
  } catch (err) { return handleError(err); }
}
