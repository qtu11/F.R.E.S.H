import { readFileSync } from 'fs';
import path from 'path';
import { loadConfig, getConnectionString } from '../lib/supabase/config';
import postgres from 'postgres';

async function run() {
  const config = loadConfig();
  const connStr = getConnectionString(config);
  if (!connStr) { console.error('Database not configured'); process.exit(1); }

  const sql = postgres(connStr, { max: 1 });
  try {
    const migrationPath = path.join(process.cwd(), 'db', 'migrations', '001_init.sql');
    await sql.unsafe(readFileSync(migrationPath, 'utf-8'));

    const users = [
      { id: 'u1', email: 'customer@fresh.com', password: '123456', name: 'John Doe', role: 'customer', avatar: 'JD', phone: '+84 90 123 4567', address: '123 Nguyen Hue, D1, HCMC', join_date: '2025-01-15', last_active: '2026-05-15', status: 'active', green_points: 1250, food_rescued: 12.5, co2_reduced: 45.2, total_orders: 28, total_spent: 850000, wallet_balance: 1500000 },
      { id: 'u2', email: 'partner@fresh.com', password: '123456', name: 'WinMart+ D1', role: 'partner', avatar: 'W', phone: '028 3822 1234', address: '123 Nguyen Hue, D1, HCMC', join_date: '2024-06-01', last_active: '2026-05-15', status: 'active', wallet_balance: 5000000 },
      { id: 'u3', email: 'freshadmin@gmail.com', password: 'AdminFresh@', name: 'Super Admin', role: 'admin', avatar: 'SA', join_date: '2024-01-01', last_active: '2026-05-16', status: 'active' },
    ];
    for (const u of users) await sql`INSERT INTO users ${sql(u)} ON CONFLICT (id) DO NOTHING`;

    const stores = [
      { id: 's1', name: 'WinMart+ D1', address: '123 Nguyen Hue, D1, HCMC', phone: '028 3822 1234', rating: 4.5, review_count: 234, is_open: true, open_hours: '7:00 - 22:00', distance: 0.3, deals_count: 12, image: '🏪', since: '2020' },
      { id: 's2', name: 'Circle K D3', address: '456 Vo Van Tan, D3, HCMC', phone: '028 3930 5678', rating: 4.2, review_count: 156, is_open: true, open_hours: '24/7', distance: 0.8, deals_count: 8, image: '🏬', since: '2019' },
    ];
    for (const s of stores) await sql`INSERT INTO stores ${sql(s)} ON CONFLICT (id) DO NOTHING`;

    const products = [
      { id: 'p1', name: 'Bánh Mì Gà', category: 'Bakery', stock: 12, original_price: 30000, ai_price: 15000, expiry: '2026-05-16 18:00', status: 'live', image: '🍞', store_id: 's1', store_name: 'WinMart+ D1', discount: 50, created_at: '2026-05-14T08:00:00Z', rating: 4.5, review_count: 23, co2_saved: 0.3, rescued_score: 85, ingredients: ['Bread', 'Chicken', 'Pate', 'Vegetables'], allergens: ['Gluten', 'Eggs'], nutrition: { calories: 320, protein: 15, carbs: 35, fat: 12, fiber: 2 }, distance: 0.3 },
      { id: 'p2', name: 'Sữa Tươi 1L', category: 'Dairy', stock: 8, original_price: 45000, ai_price: 22000, expiry: '2026-05-16 09:00', status: 'live', image: '🥛', store_id: 's1', store_name: 'WinMart+ D1', discount: 51, created_at: '2026-05-14T09:00:00Z', rating: 4.8, review_count: 45, co2_saved: 0.5, rescued_score: 92, ingredients: ['Fresh Milk'], allergens: ['Dairy'], nutrition: { calories: 150, protein: 8, carbs: 12, fat: 8, fiber: 0 }, distance: 0.3 },
    ];
    for (const p of products) await sql`INSERT INTO products ${sql(p)} ON CONFLICT (id) DO NOTHING`;

    console.log('Seed data inserted');
  } catch (err) { console.error('Seed failed:', err); process.exit(1); }
  finally { await sql.end(); }
}

run();
