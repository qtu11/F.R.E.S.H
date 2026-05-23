import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { handleError } from '@/lib/supabase/helpers';
import { toCamelCase } from '@/lib/supabase/transform';

export async function GET() {
  try {
    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    // 1. Thực hiện các truy vấn đồng thời để tối đa hóa hiệu năng
    let [metrics, districts, partnerCount, customerCount, orderCount, productsQuery] = await Promise.all([
      supabase.from('esg_metrics').select('*').order('date', { ascending: false }).limit(30),
      supabase.from('district_coverage').select('*').order('food_rescued_kg', { ascending: false }),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'partner'),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('products').select('category'),
    ]);

    if (metrics.error) return handleError(metrics.error);
    if (districts.error) return handleError(districts.error);

    // Auto seed esg_metrics if empty
    if (!metrics.data || metrics.data.length === 0) {
      const today = new Date();
      const seedMetrics = [];
      const partners = partnerCount.count || 5;
      const customers = customerCount.count || 25;
      const baseOrders = orderCount.count || 120;

      for (let i = 29; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        
        const food = Math.round(40 + Math.random() * 80);
        const co2 = Math.round(food * 2.5);
        const meals = Math.round(food / 0.5);
        const water = Math.round(food * 280);
        const trees = Math.round(co2 / 21.7);
        const dailyOrders = Math.round(5 + Math.random() * 15);

        seedMetrics.push({
          date: dateStr,
          food_rescued_kg: food,
          co2_reduced_kg: co2,
          meals_saved: meals,
          water_saved_l: water,
          trees_equivalent: trees,
          active_partners: partners,
          active_customers: customers,
          total_orders: baseOrders + (29 - i) * dailyOrders
        });
      }

      const { data: insertedMetrics, error: errMet } = await supabase
        .from('esg_metrics')
        .insert(seedMetrics)
        .select();
      
      if (!errMet && insertedMetrics) {
        metrics.data = insertedMetrics.sort((a: any, b: any) => b.date.localeCompare(a.date));
      }
    }

    // Auto seed district_coverage if empty
    if (!districts.data || districts.data.length === 0) {
      const hcmDistricts = [
        { district: 'Quận 1', coverage_pct: 85, total_stores: 14, active_stores: 12, total_orders: 450, food_rescued_kg: 1240, population_reached: 15000, updated_at: new Date().toISOString() },
        { district: 'Quận 3', coverage_pct: 72, total_stores: 10, active_stores: 8, total_orders: 280, food_rescued_kg: 850, population_reached: 9800, updated_at: new Date().toISOString() },
        { district: 'Tân Phú', coverage_pct: 65, total_stores: 18, active_stores: 15, total_orders: 310, food_rescued_kg: 920, population_reached: 12000, updated_at: new Date().toISOString() },
        { district: 'Bình Thạnh', coverage_pct: 78, total_stores: 12, active_stores: 10, total_orders: 390, food_rescued_kg: 1120, population_reached: 14000, updated_at: new Date().toISOString() },
        { district: 'Quận 5', coverage_pct: 58, total_stores: 8, active_stores: 6, total_orders: 180, food_rescued_kg: 510, population_reached: 6500, updated_at: new Date().toISOString() },
        { district: 'Gò Vấp', coverage_pct: 62, total_stores: 11, active_stores: 9, total_orders: 220, food_rescued_kg: 680, population_reached: 8000, updated_at: new Date().toISOString() }
      ];

      const { data: insertedDistricts, error: errDist } = await supabase
        .from('district_coverage')
        .insert(hcmDistricts)
        .select();

      if (!errDist && insertedDistricts) {
        districts.data = insertedDistricts.sort((a: any, b: any) => b.food_rescued_kg - a.food_rescued_kg);
      }
    }

    // 2. Tính toán phân bổ categories động từ dữ liệu sản phẩm thực tế
    const productsData = productsQuery.data || [];
    const counts: Record<string, number> = {};
    productsData.forEach((p: any) => {
      if (p.category) counts[p.category] = (counts[p.category] || 0) + 1;
    });
    const totalProducts = productsData.length || 1;
    const colors = ['#057A42', '#ff8c00', '#3b82f6', '#8b5cf6', '#ec4899'];
    const categories = Object.keys(counts).map((cat, idx) => ({
      label: cat,
      pct: `${Math.round((counts[cat] / totalProducts) * 100)}%`,
      color: colors[idx % colors.length]
    }));

    // 3. Tổng hợp các chỉ số ESG tổng quát từ esg_metrics
    const totalFoodRescued = (metrics.data || []).reduce((s: number, m: any) => s + (m.food_rescued_kg || 0), 0);
    const totalCo2Reduced = (metrics.data || []).reduce((s: number, m: any) => s + (m.co2_reduced_kg || 0), 0);
    const totalMealsSaved = (metrics.data || []).reduce((s: number, m: any) => s + (m.meals_saved || 0), 0);
    const totalWaterSaved = (metrics.data || []).reduce((s: number, m: any) => s + (m.water_saved_l || 0), 0);
    const totalTreesEquivalent = (metrics.data || []).reduce((s: number, m: any) => s + (m.trees_equivalent || 0), 0);
    const totalMethaneReduced = Math.round(totalFoodRescued * 0.09 * 10) / 10;

    // 4. Map districts cho tương thích với Frontend
    const formattedDistricts = (districts.data || []).map((d: any) => ({
      name: d.district,
      pct: d.coverage_pct || 0,
      co2: d.food_rescued_kg ? `${Math.round(d.food_rescued_kg * 2.5).toLocaleString()} kg` : '—'
    }));

    return NextResponse.json({
      metrics: toCamelCase(metrics.data || []),
      districts: formattedDistricts,
      categories,
      treesPlanted: totalTreesEquivalent > 0 ? totalTreesEquivalent.toLocaleString() : '—',
      co2Prevented: totalCo2Reduced > 0 ? `${totalCo2Reduced.toLocaleString()} kg` : '—',
      waterSaved: totalWaterSaved > 0 ? `${totalWaterSaved.toLocaleString()} L` : '—',
      methaneReduced: totalMethaneReduced > 0 ? `${totalMethaneReduced.toLocaleString()} kg` : '—',
      totals: {
        totalFoodRescued,
        totalCo2Reduced,
        totalMealsSaved,
        activePartners: partnerCount.count || 0,
        activeCustomers: customerCount.count || 0,
        totalOrders: orderCount.count || 0,
      },
    });
  } catch (err) { return handleError(err); }
}
