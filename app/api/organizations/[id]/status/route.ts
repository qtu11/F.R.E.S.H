import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { handleError } from '@/lib/supabase/helpers';
import { toCamelCase } from '@/lib/supabase/transform';
import { requireRole } from '@/lib/auth/middleware';
import { sendPartnerApprovalEmail, sendPartnerRejectionEmail } from '@/utils/email/mailer';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireRole('admin');
    if ('status' in auth) return auth;

    const { id } = await params;
    const body = await req.json();
    const { status, rejectionReason } = body;

    if (!['approved', 'rejected', 'suspended'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const updates: any = { status };
    if (status === 'approved') updates.approved_at = new Date().toISOString();
    if (status === 'rejected') updates.rejection_reason = rejectionReason || null;

    const { data, error } = await supabase
      .from('organizations')
      .update(updates)
      .eq('id', id)
      .select('*, owner:owner_id(name, email)')
      .single();

    if (error) return handleError(error);

    // Send email notification
    const orgOwner = (data as any)?.owner;
    if (orgOwner?.email) {
      if (status === 'approved') {
        sendPartnerApprovalEmail(orgOwner.email, orgOwner.name || 'Partner', (data as any).name, `${process.env.APP_URL || 'http://localhost:3001'}/partner/login`).catch(console.error);
      } else if (status === 'rejected') {
        sendPartnerRejectionEmail(orgOwner.email, orgOwner.name || 'Partner', (data as any).name, rejectionReason || 'Hồ sơ chưa đáp ứng yêu cầu thẩm định').catch(console.error);
      }
    }

    // Update all members' store access on approval: create a default store
    if (status === 'approved') {
      const org = data as any;
      const storeId = `STORE_${Date.now()}`;

      await supabase.from('stores').upsert({
        id: storeId,
        name: org.name,
        address: org.address || '',
        phone: org.phone || '',
        rating: 0,
        review_count: 0,
        is_open: true,
        open_hours: '08:00-22:00',
        distance: 0,
        deals_count: 0,
        image: `https://ui-avatars.com/api/?name=${encodeURIComponent(org.name)}&background=057A42&color=fff&size=200`,
        since: new Date().toISOString().split('T')[0],
      }).select().single();

      // Link the store to the organization
      await supabase.from('organization_branches').upsert({
        id: `BR_${Date.now()}`,
        organization_id: id,
        store_id: storeId,
        name: org.name + ' - Main Branch',
        address: org.address || '',
        phone: org.phone || '',
        status: 'active',
        created_at: new Date().toISOString(),
      });

    }

    return NextResponse.json(toCamelCase(data));
  } catch (err) { return handleError(err); }
}
