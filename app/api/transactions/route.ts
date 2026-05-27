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

import { loadConfig, getConnectionString } from '@/lib/supabase/config';
import postgres from 'postgres';

async function getDbClient() {
  const config = loadConfig();
  const connStr = getConnectionString(config);
  if (!connStr) return null;
  return postgres(connStr, { max: 1 });
}

export async function POST(req: Request) {
  let sql: postgres.Sql | null = null;
  try {
    const auth = await requireAuth();
    if ('status' in auth) return auth;

    const body = toSnakeCase(await req.json());
    
    // Đảm bảo user_id luôn khớp với phiên đăng nhập để tránh IDOR nạp/rút tiền của tài khoản khác
    const targetUserId = auth.user.role === 'admin' ? (body.user_id || auth.user.userId) : auth.user.userId;
    
    const amountVal = Number(body.amount);
    if (isNaN(amountVal) || amountVal <= 0) {
      return NextResponse.json({ error: 'Số tiền giao dịch không hợp lệ (phải lớn hơn 0)' }, { status: 400 });
    }
    body.amount = amountVal;

    sql = await getDbClient();
    if (!sql) return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });

    const newTxId = crypto.randomUUID();
    let finalBalance = 0;
    let userEmail = '';
    let userName = '';

    // Lấy thông tin user hiện tại
    const userRows = await sql`
      SELECT name, email, COALESCE(wallet_balance, 0)::numeric as wallet_balance 
      FROM users WHERE id = ${targetUserId}
    `;
    if (userRows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const user = userRows[0];
    userEmail = user.email || '';
    userName = user.name || 'Thành viên';

    if (body.type === 'withdrawal') {
      const withdrawAmount = Math.abs(body.amount);
      body.amount = -withdrawAmount;
    }

    // Bắt đầu transaction
    try {
      await sql.begin(async sql => {
        // Cập nhật số dư ví atomic
        if (body.type === 'withdrawal') {
          const withdrawAmount = Math.abs(body.amount);
          const updateRes = await sql`
            UPDATE users 
            SET wallet_balance = COALESCE(wallet_balance, 0) - ${withdrawAmount} 
            WHERE id = ${targetUserId} AND COALESCE(wallet_balance, 0) >= ${withdrawAmount}
            RETURNING wallet_balance
          `;
          if (updateRes.length === 0) {
            throw new Error('Số dư ví FRESH không đủ để thực hiện rút tiền');
          }
          finalBalance = Number(updateRes[0].wallet_balance);
        } else {
          // topup
          const updateRes = await sql`
            UPDATE users 
            SET wallet_balance = COALESCE(wallet_balance, 0) + ${body.amount} 
            WHERE id = ${targetUserId}
            RETURNING wallet_balance
          `;
          finalBalance = Number(updateRes[0].wallet_balance);
        }

        // Tạo bản ghi giao dịch
        const newTx = {
          id: newTxId,
          user_id: targetUserId,
          type: body.type,
          amount: body.amount,
          date: new Date().toISOString(),
          status: 'completed',
          description: body.description || (body.type === 'topup' ? 'Nạp tiền vào ví FRESH' : 'Rút tiền từ ví FRESH'),
          payment_method: body.payment_method || 'bank_transfer'
        };

        await sql`
          INSERT INTO transactions ${sql(newTx, 'id', 'user_id', 'type', 'amount', 'date', 'status', 'description', 'payment_method')}
        `;
      });
    } catch (dbErr: any) {
      return NextResponse.json({ error: dbErr.message || 'Giao dịch thất bại' }, { status: 400 });
    }

    const completedTx = {
      id: newTxId,
      userId: targetUserId,
      type: body.type,
      amount: body.amount,
      date: new Date().toISOString(),
      status: 'completed',
      description: body.description || (body.type === 'topup' ? 'Nạp tiền vào ví FRESH' : 'Rút tiền từ ví FRESH'),
      paymentMethod: body.payment_method || 'bank_transfer'
    };

    // Gửi email thông báo nạp/rút tiền thành công
    if (userEmail) {
      if (body.type === 'topup' && body.amount > 0) {
        sendDepositSuccessEmail(userEmail, userName, body.amount, newTxId, finalBalance).catch(err => {
          console.error('Failed to send deposit email:', err);
        });
      } else if (body.type === 'withdrawal' && body.amount < 0) {
        sendWithdrawalSuccessEmail(userEmail, userName, Math.abs(body.amount), newTxId, finalBalance).catch(err => {
          console.error('Failed to send withdrawal email:', err);
        });
      }
    }

    return NextResponse.json(completedTx, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  } finally {
    if (sql) await sql.end();
  }
}

export async function DELETE(req: Request) {
  try {
    const auth = await requireAuth();
    if ('status' in auth) return auth;

    // Chỉ admin mới có quyền xóa giao dịch ví (đề phòng khách hàng tự xóa thanh toán để hoàn tiền)
    if (auth.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Only admins can delete transactions' }, { status: 403 });
    }

    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const { id } = await req.json();
    const { data: tx } = await supabase.from('transactions').select('*').eq('id', id).single();
    
    if (!tx) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
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
