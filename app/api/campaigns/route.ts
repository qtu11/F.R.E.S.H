import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { handleError } from '@/lib/supabase/helpers';
import { toCamelCase, toSnakeCase } from '@/lib/supabase/transform';
import { requireRole } from '@/lib/auth/middleware';

export async function GET(req: Request) {
  try {
    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    // Tự động seed campaigns khi bảng trống
    const { count } = await supabase.from('campaigns').select('*', { count: 'exact', head: true });
    if (count === 0) {
      const { data: stores } = await supabase.from('stores').select('id').limit(2);
      const storeIds = stores && stores.length > 0 ? stores.map(s => s.id) : [null];
      
      const sampleCampaigns = [
        {
          id: 'c1',
          title: 'Giải cứu thực phẩm cuối ngày - Giảm 50%',
          description: 'Hỗ trợ các cửa hàng giải cứu bánh mì và thức ăn nóng cuối ngày để tránh lãng phí thức ăn.',
          type: 'flash_sale',
          status: 'active',
          discount_rate: 50,
          budget: 5000000,
          spent: 1250000,
          start_date: '2026-05-01T00:00:00Z',
          end_date: '2026-06-01T00:00:00Z',
          created_at: new Date().toISOString(),
          store_id: storeIds[0],
          target_impressions: 10000,
          target_conversions: 500,
          actual_impressions: 4250,
          actual_conversions: 185
        },
        {
          id: 'c2',
          title: 'Chiến dịch Green Point Nhân 2',
          description: 'Nhận gấp đôi điểm xanh khi mua thực phẩm được dán nhãn giải cứu từ các siêu thị WinMart.',
          type: 'esg',
          status: 'active',
          discount_rate: 0,
          budget: 10000000,
          spent: 4200000,
          start_date: '2026-05-10T00:00:00Z',
          end_date: '2026-05-30T00:00:00Z',
          created_at: new Date().toISOString(),
          store_id: storeIds[1] || storeIds[0],
          target_impressions: 25000,
          target_conversions: 1500,
          actual_impressions: 12800,
          actual_conversions: 840
        },
        {
          id: 'c3',
          title: 'Mời bạn mới - Nhận ví 50k',
          description: 'Giới thiệu bạn bè tham gia cộng đồng F.R.E.S.H. Nhận ngay 50.000đ vào ví khi bạn mới hoàn thành đơn hàng giải cứu đầu tiên.',
          type: 'referral',
          status: 'active',
          discount_rate: 0,
          budget: 8000000,
          spent: 3500000,
          start_date: '2026-01-01T00:00:00Z',
          end_date: '2026-12-31T00:00:00Z',
          created_at: new Date().toISOString(),
          store_id: null,
          target_impressions: 15000,
          target_conversions: 800,
          actual_impressions: 8900,
          actual_conversions: 450
        }
      ];
      await supabase.from('campaigns').insert(sampleCampaigns);
    }

    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('storeId');
    let builder = supabase.from('campaigns').select('*').order('created_at', { ascending: false });
    if (storeId) builder = builder.eq('store_id', storeId);
    const { data, error } = await builder;
    if (error) return handleError(error);
    return NextResponse.json(toCamelCase(data || []));
  } catch (err) { return handleError(err); }
}

export async function POST(req: Request) {
  try {
    const auth = await requireRole('admin');
    if ('status' in auth) return auth;

    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });
    const body = toSnakeCase(await req.json());
    const newCampaign = { ...body, id: crypto.randomUUID(), created_at: new Date().toISOString() };
    const { data: result, error } = await supabase.from('campaigns').insert(newCampaign).select().single();
    if (error) return handleError(error);
    return NextResponse.json(toCamelCase(result), { status: 201 });
  } catch (err) { return handleError(err); }
}

export async function PATCH(req: Request) {
  try {
    const auth = await requireRole('admin');
    if ('status' in auth) return auth;

    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });
    const body = toSnakeCase(await req.json());
    const { id, ...updates } = body;
    const { data, error } = await supabase.from('campaigns').update(updates).eq('id', id).select().single();
    if (error) return handleError(error);
    return NextResponse.json(toCamelCase(data));
  } catch (err) { return handleError(err); }
}
