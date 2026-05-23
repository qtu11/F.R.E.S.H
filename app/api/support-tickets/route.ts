import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { handleError } from '@/lib/supabase/helpers';
import { toCamelCase, toSnakeCase } from '@/lib/supabase/transform';
import { requireRole, requireAnyRole } from '@/lib/auth/middleware';

export async function GET(req: Request) {
  try {
    const auth = await requireAnyRole(['customer', 'partner', 'admin']);
    if ('status' in auth) return auth;

    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    let builder = supabase.from('support_tickets').select('*').order('created_at', { ascending: false });
    if (status) builder = builder.eq('status', status);

    // Phân quyền & IDOR: Khách hàng/đối tác chỉ xem được ticket của chính mình. Admin xem được tất cả.
    if (auth.user.role !== 'admin') {
      const { data: user } = await supabase.from('users').select('name').eq('id', auth.user.userId).single();
      const userName = user?.name || '';
      builder = builder.eq('customer', userName);
    }

    let { data: tickets, error } = await builder;
    if (error) return handleError(error);

    if ((!tickets || tickets.length === 0) && !status) {
      // Auto seed support tickets using actual customer names if empty
      const { data: customers } = await supabase.from('users').select('name').eq('role', 'customer');
      const customerNames = (customers || []).map((c: any) => c.name);
      const fallbackCustomers = ['Minh Trần', 'Test User', 'Reg Test', 'Lan Nguyễn'];

      const getCustomerName = (idx: number) => {
        if (customerNames.length > 0) return customerNames[idx % customerNames.length];
        return fallbackCustomers[idx % fallbackCustomers.length];
      };

      const seedTickets = [
        {
          id: `TCK-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
          customer: getCustomerName(0),
          issue: 'My wallet balance was charged but the order was cancelled automatically by the store. Please refund.',
          priority: 'High',
          status: 'open',
          created_at: new Date().toISOString(),
          category: 'payment'
        },
        {
          id: `TCK-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
          customer: getCustomerName(1),
          issue: 'Delivery driver did not deliver the food, but the status is marked as completed on the app.',
          priority: 'Urgent',
          status: 'open',
          created_at: new Date(Date.now() - 1800000).toISOString(),
          category: 'delivery'
        },
        {
          id: `TCK-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
          customer: getCustomerName(2),
          issue: 'I cannot apply the discount voucher for food-rescue orders from Pizza Company store.',
          priority: 'Medium',
          status: 'open',
          created_at: new Date(Date.now() - 7200000).toISOString(),
          category: 'product'
        }
      ];

      const { data: inserted, error: insertError } = await supabase
        .from('support_tickets')
        .insert(seedTickets)
        .select();

      if (insertError) {
        console.error("Auto-seeding support_tickets failed:", insertError);
      } else if (inserted) {
        tickets = inserted;
      }
    }

    const enriched = await Promise.all((tickets || []).map(async (t: any) => {
      const { data: responses } = await supabase.from('ticket_responses').select('*').eq('ticket_id', t.id);
      return { ...t, responses: responses || [] };
    }));
    return NextResponse.json(toCamelCase(enriched));
  } catch (err) { return handleError(err); }
}

export async function PATCH(req: Request) {
  try {
    const auth = await requireAnyRole(['customer', 'partner', 'admin']);
    if ('status' in auth) return auth;

    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const body = toSnakeCase(await req.json());
    const { id, ...updates } = body;

    // Lấy ticket hiện tại để check IDOR
    const { data: ticket, error: ticketErr } = await supabase.from('support_tickets').select('*').eq('id', id).single();
    if (ticketErr || !ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // IDOR check: Chỉ admin mới được sửa ticket của người khác. Khách hàng/đối tác chỉ sửa của chính mình.
    if (auth.user.role !== 'admin') {
      const { data: user } = await supabase.from('users').select('name').eq('id', auth.user.userId).single();
      const userName = user?.name || '';
      if (ticket.customer !== userName) {
        return NextResponse.json({ error: 'Unauthorized: IDOR detected' }, { status: 403 });
      }

      // Bảo mật: Khách hàng không được thay đổi độ ưu tiên (priority)
      if ('priority' in updates) {
        delete updates.priority;
      }
    }

    await supabase.from('support_tickets').update(updates).eq('id', id);

    const { data: updatedTicket } = await supabase.from('support_tickets').select('*').eq('id', id).single();
    const { data: responses } = await supabase.from('ticket_responses').select('*').eq('ticket_id', id);
    return NextResponse.json(toCamelCase({ ...updatedTicket, responses: responses || [] }));
  } catch (err) { return handleError(err); }
}
