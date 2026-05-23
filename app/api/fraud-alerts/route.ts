import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { handleError } from '@/lib/supabase/helpers';
import { toCamelCase } from '@/lib/supabase/transform';

export async function GET() {
  try {
    const supabase = getServerClient();
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

    let { data, error } = await supabase.from('fraud_alerts').select('*');
    if (error) return handleError(error);

    if (!data || data.length === 0) {
      // Fetch actual stores to map real stores in fraud alerts
      const { data: stores } = await supabase.from('stores').select('name');
      const storeNames = (stores || []).map((s: any) => s.name);
      const fallbackStores = ['Bánh Mì Huỳnh Hoa', 'Phở Hùng Q1', 'Gà Rán KFC Nguyễn Thị Thập', 'Gong Cha Hồ Tùng Mậu'];
      
      const getStoreName = (idx: number) => {
        if (storeNames.length > 0) return storeNames[idx % storeNames.length];
        return fallbackStores[idx % fallbackStores.length];
      };

      const seedAlerts = [
        {
          id: `FRD-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
          type: 'Abnormal Discount Spike',
          store: getStoreName(0),
          risk: 'Critical',
          score: 95,
          time: new Date().toISOString(),
          description: 'A 90% discount campaign was published with limit 1000 items, deviating from the typical 20-50% threshold.',
          status: 'open'
        },
        {
          id: `FRD-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
          type: 'Rapid Order Inflow',
          store: getStoreName(1),
          risk: 'High',
          score: 87,
          time: new Date(Date.now() - 3600000).toISOString(),
          description: '150 orders placed within 3 minutes from 12 distinct IPs pointing to a potential sybil attack.',
          status: 'open'
        },
        {
          id: `FRD-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
          type: 'Multiple Voucher Abuse',
          store: getStoreName(2),
          risk: 'Medium',
          score: 64,
          time: new Date(Date.now() - 7200000).toISOString(),
          description: 'Same billing device ID used across 5 new accounts to redeem introductory food-rescue vouchers.',
          status: 'open'
        }
      ];

      const { data: inserted, error: insertError } = await supabase
        .from('fraud_alerts')
        .insert(seedAlerts)
        .select();

      if (insertError) {
        console.error("Auto-seeding fraud_alerts failed:", insertError);
      } else if (inserted) {
        data = inserted;
      }
    }

    return NextResponse.json(toCamelCase(data || []));
  } catch (err) { return handleError(err); }
}
