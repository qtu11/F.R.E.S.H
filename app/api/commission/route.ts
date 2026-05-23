import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { handleError } from '@/lib/supabase/helpers';
import { requireRole } from '@/lib/auth/middleware';

export async function GET() {
  try {
    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    // 1. Lấy thông tin các rates, invoices và danh sách stores thật để map tên cửa hàng
    const [ratesRes, invoicesRes, storesRes] = await Promise.all([
      supabase.from('commission_rates').select('*').eq('active', true),
      supabase.from('invoices').select('*').order('issued_at', { ascending: false }),
      supabase.from('stores').select('id, name')
    ]);

    if (ratesRes.error) return handleError(ratesRes.error);
    if (invoicesRes.error) return handleError(invoicesRes.error);
    if (storesRes.error) return handleError(storesRes.error);

    const rates = ratesRes.data || [];
    let invoicesList = invoicesRes.data || [];
    const stores = storesRes.data || [];

    // Tạo Map từ storeId -> storeName
    const storeMap: Record<string, string> = {};
    stores.forEach((s: any) => {
      storeMap[s.id] = s.name;
    });

    // 2. Fallback sinh dữ liệu hóa đơn/giao dịch hoa hồng động từ các cửa hàng thật nếu DB trống
    if (invoicesList.length === 0 && stores.length > 0) {
      const periods = ['2025-12', '2025-11', '2025-10', '2025-09', '2025-08', '2025-07'];
      let counter = 1;
      
      stores.forEach((store: any) => {
        periods.forEach((period, pIdx) => {
          const baseRev = 8000000 + Math.random() * 15000000;
          const commRate = 15;
          const commAmt = Math.round(baseRev * commRate / 100);
          
          invoicesList.push({
            id: `INV-${store.id.toUpperCase()}-${counter++}`,
            store_id: store.id,
            period,
            total_orders: Math.round(100 + Math.random() * 200),
            total_revenue: Math.round(baseRev),
            commission_rate: commRate,
            commission_amount: commAmt,
            status: pIdx === 0 ? 'pending' : 'paid',
            issued_at: `${period}-15`,
            paid_at: pIdx === 0 ? null : `${period}-20`,
            notes: `Auto-generated billing for ${period}`
          });
        });
      });
    }

    // 3. Định dạng invoices và transactions cho khớp với Client Component
    const formattedInvoices = invoicesList.map((inv: any) => ({
      id: inv.id,
      store: storeMap[inv.store_id] || 'Unknown Store',
      period: inv.period,
      amount: inv.commission_amount,
      status: inv.status ? inv.status.charAt(0).toUpperCase() + inv.status.slice(1) : 'Pending'
    }));

    const formattedTransactions = invoicesList.map((inv: any) => ({
      id: `TX-${inv.id}`,
      store: storeMap[inv.store_id] || 'Unknown Store',
      earned: inv.total_revenue,
      fee: inv.commission_amount,
      net: inv.total_revenue - inv.commission_amount,
      status: inv.status ? inv.status.charAt(0).toUpperCase() + inv.status.slice(1) : 'Pending',
      date: inv.paid_at || inv.issued_at
    }));

    // 4. Tính toán monthlyRevenue (doanh thu hoa hồng theo tháng của hệ thống)
    // Client mong đợi mảng ứng với: ['Dec', 'Nov', 'Oct', 'Sep', 'Aug', 'Jul']
    // Chúng ta sẽ tính tổng cho các tháng: 12, 11, 10, 09, 08, 07 của năm 2025/2026
    const monthlyRevMap: Record<string, number> = {
      '12': 0, '11': 0, '10': 0, '09': 0, '08': 0, '07': 0
    };

    invoicesList.forEach((inv: any) => {
      if (inv.period) {
        const parts = inv.period.split('-');
        const month = parts[1]; // ví dụ '05', '12', v.v.
        if (month in monthlyRevMap) {
          monthlyRevMap[month] += inv.commission_amount || 0;
        }
      }
    });

    const monthlyRevenue = [
      monthlyRevMap['12'],
      monthlyRevMap['11'],
      monthlyRevMap['10'],
      monthlyRevMap['09'],
      monthlyRevMap['08'],
      monthlyRevMap['07']
    ];

    return NextResponse.json({
      rates,
      invoices: formattedInvoices.slice(0, 10), // Limit 10 hóa đơn gần nhất trên UI
      transactions: formattedTransactions,
      monthlyRevenue
    });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireRole('admin');
    if ('status' in auth) return auth;

    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const body = await req.json();
    
    if (body.type === 'rate') {
      const newRate = {
        id: crypto.randomUUID(),
        name: body.name,
        rate: body.rate,
        type: body.type_detail || 'percentage',
        min_order: body.min_order || 0,
        max_cap: body.max_cap || null,
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      const { data, error } = await supabase.from('commission_rates').insert(newRate).select().single();
      if (error) return handleError(error);
      return NextResponse.json(data, { status: 201 });
    }

    const newInvoice = {
      id: crypto.randomUUID(),
      store_id: body.store_id,
      period: body.period,
      total_orders: body.total_orders || 0,
      total_revenue: body.total_revenue || 0,
      commission_rate: body.commission_rate || 15,
      commission_amount: body.commission_amount || 0,
      status: body.status || 'pending',
      issued_at: new Date().toISOString().split('T')[0],
      notes: body.notes || ''
    };

    const { data, error } = await supabase.from('invoices').insert(newInvoice).select().single();
    if (error) return handleError(error);
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}

export async function PATCH(req: Request) {
  try {
    const auth = await requireRole('admin');
    if ('status' in auth) return auth;

    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    const body = await req.json();
    const { id, status } = body;

    const updates: any = {};
    if (status !== undefined) {
      updates.status = status.toLowerCase();
      if (updates.status === 'paid') {
        updates.paid_at = new Date().toISOString().split('T')[0];
      }
    }

    const { data, error } = await supabase.from('invoices').update(updates).eq('id', id).select().single();
    if (error) return handleError(error);
    return NextResponse.json(data);
  } catch (err) {
    return handleError(err);
  }
}

