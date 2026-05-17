import { NextResponse } from 'next/server';
import { loadConfig, getConnectionString } from '@/lib/supabase/config';
import postgres from 'postgres';
import fs from 'fs';
import path from 'path';

async function runMigrations(sql: postgres.Sql) {
  const migrationPath = path.join(process.cwd(), 'db', 'migrations', '001_init.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
  await sql.unsafe(migrationSQL);
}

async function seedData(sql: postgres.Sql) {
  const users = [
    { id: 'u1', email: 'customer@fresh.com', password: '123456', name: 'John Doe', role: 'customer', avatar: 'JD', phone: '+84 90 123 4567', address: '123 Nguyen Hue, D1, HCMC', join_date: '2025-01-15', last_active: '2026-05-15', status: 'active', green_points: 1250, food_rescued: 12.5, co2_reduced: 45.2, total_orders: 28, total_spent: 850000, wallet_balance: 1500000 },
    { id: 'u2', email: 'partner@fresh.com', password: '123456', name: 'WinMart+ D1', role: 'partner', avatar: 'W', phone: '028 3822 1234', address: '123 Nguyen Hue, D1, HCMC', join_date: '2024-06-01', last_active: '2026-05-15', status: 'active', wallet_balance: 5000000 },
    { id: 'u3', email: 'freshadmin@gmail.com', password: 'AdminFresh@', name: 'Super Admin', role: 'admin', avatar: 'SA', join_date: '2024-01-01', last_active: '2026-05-16', status: 'active' },
    { id: 'u4', email: 'jane@fresh.com', password: '123456', name: 'Jane Smith', role: 'customer', avatar: 'JS', phone: '+84 91 234 5678', join_date: '2025-03-20', last_active: '2026-05-14', status: 'active', green_points: 890, food_rescued: 8.3, co2_reduced: 32.1, total_orders: 15, total_spent: 420000, wallet_balance: 300000 },
    { id: 'u5', email: 'circlek@fresh.com', password: '123456', name: 'Circle K D3', role: 'partner', avatar: 'CK', phone: '028 3930 5678', join_date: '2024-08-15', last_active: '2026-05-15', status: 'active', wallet_balance: 2000000 },
    { id: 'u6', email: 'bob@fresh.com', password: '123456', name: 'Bob Wilson', role: 'customer', avatar: 'BW', phone: '+84 92 345 6789', join_date: '2025-06-10', last_active: '2026-05-10', status: 'suspended', green_points: 120, food_rescued: 1.2, co2_reduced: 4.5, total_orders: 3, total_spent: 85000, wallet_balance: 50000 },
    { id: 'u7', email: 'aeon@fresh.com', password: '123456', name: 'AEON Mall Binh Tan', role: 'partner', avatar: 'AE', phone: '028 3756 7890', join_date: '2024-03-01', last_active: '2026-05-15', status: 'active', wallet_balance: 8000000 },
    { id: 'u8', email: 'alice@fresh.com', password: '123456', name: 'Alice Chen', role: 'customer', avatar: 'AC', phone: '+84 93 456 7890', join_date: '2025-09-01', last_active: '2026-05-13', status: 'active', green_points: 2100, food_rescued: 25.8, co2_reduced: 98.5, total_orders: 52, total_spent: 1500000, wallet_balance: 2500000 },
    { id: 'u9', email: 'spammer@fresh.com', password: '123456', name: 'Spam Account', role: 'customer', avatar: 'SP', join_date: '2026-05-10', last_active: '2026-05-10', status: 'banned', wallet_balance: 0 },
    { id: 'u10', email: 'coopmart@fresh.com', password: '123456', name: 'Co.opmart D7', role: 'partner', avatar: 'CM', phone: '028 5412 3456', join_date: '2024-01-15', last_active: '2026-05-15', status: 'active', wallet_balance: 3500000 },
  ];
  for (const u of users) {
    await sql`INSERT INTO users ${sql(u)} ON CONFLICT (id) DO NOTHING`;
  }

  const stores = [
    { id: 's1', name: 'WinMart+ D1', address: '123 Nguyen Hue, D1, HCMC', phone: '028 3822 1234', rating: 4.5, review_count: 234, is_open: true, open_hours: '7:00 - 22:00', distance: 0.3, deals_count: 12, image: '🏪', since: '2020' },
    { id: 's2', name: 'Circle K D3', address: '456 Vo Van Tan, D3, HCMC', phone: '028 3930 5678', rating: 4.2, review_count: 156, is_open: true, open_hours: '24/7', distance: 0.8, deals_count: 8, image: '🏬', since: '2019' },
    { id: 's3', name: 'GS25 - Dist 1', address: '789 Le Loi, D1, HCMC', phone: '028 3821 9012', rating: 4.3, review_count: 189, is_open: true, open_hours: '6:00 - 23:00', distance: 0.5, deals_count: 15, image: '🏪', since: '2021' },
    { id: 's4', name: 'Co.opmart D7', address: '101 Nguyen Van Linh, D7, HCMC', phone: '028 5412 3456', rating: 4.6, review_count: 567, is_open: true, open_hours: '8:00 - 22:00', distance: 2.1, deals_count: 20, image: '🏬', since: '2018' },
    { id: 's5', name: 'AEON Mall Binh Tan', address: '1 Binh Tan, Binh Tan, HCMC', phone: '028 3756 7890', rating: 4.7, review_count: 890, is_open: true, open_hours: '9:00 - 22:00', distance: 5.3, deals_count: 35, image: '🏢', since: '2017' },
    { id: 's6', name: 'FamilyMart D2', address: '200 Thao Dien, D2, HCMC', phone: '028 3519 1234', rating: 4.1, review_count: 98, is_open: false, open_hours: '7:00 - 22:00', distance: 1.5, deals_count: 5, image: '🏪', since: '2022' },
    { id: 's7', name: 'Lotte Mart D7', address: '469 Nguyen Huu Tho, D7, HCMC', phone: '028 5412 5678', rating: 4.4, review_count: 432, is_open: true, open_hours: '8:00 - 22:00', distance: 3.2, deals_count: 18, image: '🏬', since: '2016' },
    { id: 's8', name: 'MM Mega Market', address: '151 Dong Khoi, D1, HCMC', phone: '028 3822 9012', rating: 4.0, review_count: 145, is_open: true, open_hours: '6:00 - 21:00', distance: 0.7, deals_count: 10, image: '🏪', since: '2020' },
  ];
  for (const s of stores) {
    await sql`INSERT INTO stores ${sql(s)} ON CONFLICT (id) DO NOTHING`;
  }

  const products = [
    { id: 'p1', name: 'Bánh Mì Gà', category: 'Bakery', stock: 12, original_price: 30000, ai_price: 15000, expiry: '2026-05-16 18:00', status: 'live', image: '🍞', store_id: 's1', store_name: 'WinMart+ D1', discount: 50, created_at: '2026-05-14T08:00:00Z', rating: 4.5, review_count: 23, co2_saved: 0.3, rescued_score: 85, ingredients: JSON.stringify(['Bread', 'Chicken', 'Pate', 'Vegetables']), allergens: JSON.stringify(['Gluten', 'Eggs']), nutrition: JSON.stringify({ calories: 320, protein: 15, carbs: 35, fat: 12, fiber: 2 }), distance: 0.3 },
    { id: 'p2', name: 'Sữa Tươi 1L', category: 'Dairy', stock: 8, original_price: 45000, ai_price: 22000, expiry: '2026-05-16 09:00', status: 'live', image: '🥛', store_id: 's1', store_name: 'WinMart+ D1', discount: 51, created_at: '2026-05-14T09:00:00Z', rating: 4.8, review_count: 45, co2_saved: 0.5, rescued_score: 92, ingredients: JSON.stringify(['Fresh Milk']), allergens: JSON.stringify(['Dairy']), nutrition: JSON.stringify({ calories: 150, protein: 8, carbs: 12, fat: 8, fiber: 0 }), distance: 0.3 },
    { id: 'p3', name: 'Salad Trộn', category: 'Vegetables', stock: 0, original_price: 55000, ai_price: 25000, expiry: '2026-05-16 22:00', status: 'out_of_stock', image: '🥗', store_id: 's2', store_name: 'Circle K D3', discount: 55, created_at: '2026-05-13T10:00:00Z', rating: 4.2, review_count: 18, co2_saved: 0.4, rescued_score: 78, ingredients: JSON.stringify(['Lettuce', 'Tomato', 'Cucumber', 'Dressing']), allergens: JSON.stringify([]), nutrition: JSON.stringify({ calories: 120, protein: 3, carbs: 15, fat: 5, fiber: 4 }), distance: 0.8 },
    { id: 'p4', name: 'Cơm Hộp Gà', category: 'Meals', stock: 5, original_price: 45000, ai_price: 15000, expiry: '2026-05-16 14:00', status: 'live', image: '🍱', store_id: 's2', store_name: 'Circle K D3', discount: 67, created_at: '2026-05-14T10:00:00Z', rating: 4.0, review_count: 32, co2_saved: 0.6, rescued_score: 88, ingredients: JSON.stringify(['Rice', 'Chicken', 'Vegetables', 'Sauce']), allergens: JSON.stringify(['Soy']), nutrition: JSON.stringify({ calories: 450, protein: 25, carbs: 55, fat: 15, fiber: 3 }), distance: 0.8 },
    { id: 'p5', name: 'Bánh Croissant', category: 'Bakery', stock: 15, original_price: 25000, ai_price: 10000, expiry: '2026-05-16 20:00', status: 'live', image: '🥐', store_id: 's3', store_name: 'GS25 - Dist 1', discount: 60, created_at: '2026-05-14T11:00:00Z', rating: 4.6, review_count: 56, co2_saved: 0.2, rescued_score: 90, ingredients: JSON.stringify(['Flour', 'Butter', 'Sugar', 'Yeast']), allergens: JSON.stringify(['Gluten', 'Dairy']), nutrition: JSON.stringify({ calories: 280, protein: 5, carbs: 30, fat: 16, fiber: 1 }), distance: 0.5 },
    { id: 'p6', name: 'Nước Ép Cam', category: 'Beverages', stock: 20, original_price: 35000, ai_price: 12000, expiry: '2026-05-16 16:00', status: 'live', image: '🍊', store_id: 's3', store_name: 'GS25 - Dist 1', discount: 66, created_at: '2026-05-14T12:00:00Z', rating: 4.3, review_count: 28, co2_saved: 0.3, rescued_score: 82, ingredients: JSON.stringify(['Orange Juice']), allergens: JSON.stringify([]), nutrition: JSON.stringify({ calories: 110, protein: 2, carbs: 26, fat: 0, fiber: 1 }), distance: 0.5 },
    { id: 'p7', name: 'Pizza Margherita', category: 'Fast Food', stock: 3, original_price: 89000, ai_price: 27000, expiry: '2026-05-16 19:00', status: 'live', image: '🍕', store_id: 's4', store_name: 'Co.opmart D7', discount: 70, created_at: '2026-05-14T13:00:00Z', rating: 4.7, review_count: 67, co2_saved: 0.8, rescued_score: 95, ingredients: JSON.stringify(['Dough', 'Tomato', 'Mozzarella', 'Basil']), allergens: JSON.stringify(['Gluten', 'Dairy']), nutrition: JSON.stringify({ calories: 520, protein: 22, carbs: 58, fat: 22, fiber: 3 }), distance: 2.1 },
    { id: 'p8', name: 'Sushi Combo', category: 'Meals', stock: 7, original_price: 120000, ai_price: 36000, expiry: '2026-05-16 15:00', status: 'live', image: '🍣', store_id: 's4', store_name: 'Co.opmart D7', discount: 70, created_at: '2026-05-14T14:00:00Z', rating: 4.9, review_count: 89, co2_saved: 1.2, rescued_score: 98, ingredients: JSON.stringify(['Rice', 'Salmon', 'Tuna', 'Avocado', 'Nori']), allergens: JSON.stringify(['Fish', 'Soy']), nutrition: JSON.stringify({ calories: 380, protein: 20, carbs: 45, fat: 12, fiber: 2 }), distance: 2.1 },
    { id: 'p9', name: 'Kem Vanilla', category: 'Frozen', stock: 10, original_price: 55000, ai_price: 17000, expiry: '2026-05-20 00:00', status: 'live', image: '🍦', store_id: 's5', store_name: 'AEON Mall Binh Tan', discount: 69, created_at: '2026-05-14T15:00:00Z', rating: 4.4, review_count: 34, co2_saved: 0.4, rescued_score: 75, ingredients: JSON.stringify(['Milk', 'Cream', 'Sugar', 'Vanilla']), allergens: JSON.stringify(['Dairy']), nutrition: JSON.stringify({ calories: 250, protein: 4, carbs: 30, fat: 14, fiber: 0 }), distance: 5.3 },
  ];
  for (const p of products) {
    await sql`INSERT INTO products ${sql(p)} ON CONFLICT (id) DO NOTHING`;
  }
}

export async function POST() {
  try {
    const config = loadConfig();
    const connStr = getConnectionString(config);
    if (!connStr) {
      return NextResponse.json({ error: 'Database password not configured' }, { status: 400 });
    }
    const sql = postgres(connStr, { max: 1 });
    await runMigrations(sql);
    await seedData(sql);
    await sql.end();
    return NextResponse.json({ success: true, message: 'Database initialized and seeded successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Seed failed' }, { status: 500 });
  }
}
