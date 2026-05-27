import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { handleError } from '@/lib/supabase/helpers';
import { toCamelCase, toSnakeCase } from '@/lib/supabase/transform';
import { requireAuth } from '@/lib/auth/middleware';
import { sendDepositSuccessEmail, sendWithdrawalSuccessEmail } from '@/utils/email/mailer';

export async function GET(req: Request) {
  try {
    const auth = await requireAuth();
    if ('status' in auth) return auth;

    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || (auth.user.role === 'admin' ? undefined : auth.user.userId);
    const type = searchParams.get('type');

    // IDOR check: Chỉ admin mới xem được giao dịch của người khác
    if (userId && auth.user.role !== 'admin' && auth.user.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized: IDOR detected' }, { status: 403 });
    }

    let builder = supabase.from('transactions').select('*').order('date', { ascending: false });
    if (userId) builder = builder.eq('user_id', userId);
    if (type) builder = builder.eq('type', type);

    const { data, error } = await builder;
    if (error) return handleError(error);
    return NextResponse.json(toCamelCase(data || []));
  } catch (err) { return handleError(err); }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuth();
    if ('status' in auth) return auth;

    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const body = toSnakeCase(await req.json());
    
    // Đảm bảo user_id luôn khớp với phiên đăng nhập để tránh IDOR nạp/rút tiền của tài khoản khác
    const targetUserId = auth.user.role === 'admin' ? (body.user_id || auth.user.userId) : auth.user.userId;
    
    const newTx = { 
      ...body, 
      id: crypto.randomUUID(),
      user_id: targetUserId
    };
    
    const { error: txErr } = await supabase.from('transactions').insert(newTx);
    if (txErr) return handleError(txErr);

    // Cập nhật số dư ví, lấy thêm name và email để gửi thư
    const { data: user, error: userErr } = await supabase.from('users').select('wallet_balance, name, email').eq('id', targetUserId).single();
    if (userErr) return handleError(userErr);
    
    if (user) {
      const newBalance = (user.wallet_balance || 0) + body.amount;
      const { error: updateErr } = await supabase.from('users').update({ wallet_balance: newBalance }).eq('id', targetUserId);
      if (updateErr) return handleError(updateErr);

      // Gửi email thông báo nạp/rút tiền thành công
      if (user.email) {
        if (body.type === 'topup' && body.amount > 0) {
          sendDepositSuccessEmail(user.email, user.name || 'Thành viên', body.amount, newTx.id, newBalance).catch(err => {
            console.error('Failed to send deposit email:', err);
          });
        } else if (body.type === 'withdrawal' && body.amount < 0) {
          sendWithdrawalSuccessEmail(user.email, user.name || 'Thành viên', Math.abs(body.amount), newTx.id, newBalance).catch(err => {
            console.error('Failed to send withdrawal email:', err);
          });
        }
      }
    }

    return NextResponse.json(toCamelCase(newTx), { status: 201 });
  } catch (err) { return handleError(err); }
}

export async function DELETE(req: Request) {
  try {
    const auth = await requireAuth();
    if ('status' in auth) return auth;

    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const { id } = await req.json();
    const { data: tx } = await supabase.from('transactions').select('*').eq('id', id).single();
    
    if (!tx) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // IDOR check: Chỉ admin hoặc chủ giao dịch mới được xoá
    if (auth.user.role !== 'admin' && tx.user_id !== auth.user.userId) {
      return NextResponse.json({ error: 'Unauthorized: IDOR detected' }, { status: 403 });
    }

    if (tx.user_id) {
      const { data: user, error: userErr } = await supabase.from('users').select('wallet_balance').eq('id', tx.user_id).single();
      if (userErr) return handleError(userErr);
      if (user) {
        const { error: updateErr } = await supabase.from('users').update({ wallet_balance: (user.wallet_balance || 0) - (tx.amount || 0) }).eq('id', tx.user_id);
        if (updateErr) return handleError(updateErr);
      }
    }
    const { error: deleteErr } = await supabase.from('transactions').delete().eq('id', id);
    if (deleteErr) return handleError(deleteErr);
    return NextResponse.json({ success: true });
  } catch (err) { return handleError(err); }
}
