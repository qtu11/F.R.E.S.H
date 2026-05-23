import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { handleError } from '@/lib/supabase/helpers';
import { toCamelCase } from '@/lib/supabase/transform';

export async function GET() {
  try {
    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    // Tự động seed banners khi bảng trống
    const { count } = await supabase.from('banners').select('*', { count: 'exact', head: true });
    if (count === 0) {
      const { data: stores } = await supabase.from('stores').select('id').limit(2);
      const storeIds = stores && stores.length > 0 ? stores.map(s => s.id) : [null];
      
      const sampleBanners = [
        {
          id: 'b1',
          title: 'Chung Tay Giảm CO2',
          subtitle: 'Mua thực phẩm cận date để giảm thiểu rác thải hữu cơ và bảo vệ hành tinh xanh của chúng ta.',
          image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=60',
          color: 'emerald',
          action_url: '/customer/impact',
          active: true,
          priority: 3,
          created_at: new Date().toISOString(),
          store_id: null
        },
        {
          id: 'b2',
          title: 'WinMart+ Đang Khuyến Mãi Lớn',
          subtitle: 'Combo gà rán và salad tươi giảm đến 50% chỉ hôm nay trong khung giờ 20h - 22h.',
          image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=60',
          color: 'blue',
          action_url: `/customer/stores?id=${storeIds[0] || ''}`,
          active: true,
          priority: 2,
          created_at: new Date().toISOString(),
          store_id: storeIds[0]
        },
        {
          id: 'b3',
          title: 'Thử Thách Ăn Xanh - Điểm Xanh Vô Hạn',
          subtitle: 'Đạt danh hiệu "Eco Warrior" tháng này để nhận ưu đãi miễn phí giao hàng trọn đời.',
          image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&auto=format&fit=crop&q=60',
          color: 'purple',
          action_url: '/customer/gamification',
          active: true,
          priority: 1,
          created_at: new Date().toISOString(),
          store_id: null
        }
      ];
      await supabase.from('banners').insert(sampleBanners);
    }

    const { data, error } = await supabase.from('banners').select('*').eq('active', true).order('priority', { ascending: false });
    if (error) return handleError(error);
    return NextResponse.json(toCamelCase(data || []));
  } catch (err) { return handleError(err); }
}
