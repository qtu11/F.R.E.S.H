import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { handleError } from '@/lib/supabase/helpers';
import { toCamelCase } from '@/lib/supabase/transform';
import { requireAnyRole } from '@/lib/auth/middleware';

export async function POST(req: Request) {
  try {
    const auth = await requireAnyRole(['customer', 'admin']);
    if ('status' in auth) return auth;

    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const { ticketId, message } = await req.json();

    // 1. Kiểm tra sự tồn tại của ticket
    const { data: ticket, error: ticketErr } = await supabase.from('support_tickets').select('*').eq('id', ticketId).single();
    if (ticketErr || !ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Lấy thông tin user hiện tại từ DB để lấy tên chính xác của họ
    const { data: user } = await supabase.from('users').select('name').eq('id', auth.user.userId).single();
    const userName = user?.name || 'Anonymous';

    // 2. Chống IDOR: Khách hàng chỉ được phản hồi ticket của chính mình
    if (auth.user.role !== 'admin' && ticket.customer !== userName) {
      return NextResponse.json({ error: 'Unauthorized: IDOR detected' }, { status: 403 });
    }

    // Xác định người gửi (from_text) an toàn: Chống mạo danh (spoofing)
    const fromText = auth.user.role === 'admin' ? `Support Agent (${userName})` : userName;

    const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    await supabase.from('ticket_responses').insert({ ticket_id: ticketId, from_text: fromText, message, time });

    const { data: updatedTicket } = await supabase.from('support_tickets').select('*').eq('id', ticketId).single();
    const { data: responses } = await supabase.from('ticket_responses').select('*').eq('ticket_id', ticketId).order('id', { ascending: true });
    return NextResponse.json(toCamelCase({ ...updatedTicket, responses: responses || [] }));
  } catch (err) { return handleError(err); }
}
