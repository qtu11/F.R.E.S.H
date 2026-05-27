import { readFileSync } from 'fs';
import path from 'path';
import { loadConfig, getConnectionString } from '../lib/supabase/config';
import postgres from 'postgres';
import bcrypt from 'bcryptjs';

async function hash(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function run() {
  const config = loadConfig();
  const connStr = getConnectionString(config);
  if (!connStr) { console.error('Database not configured'); process.exit(1); }

  const sql = postgres(connStr, { max: 1 });
  try {
    const migrationPath = path.join(process.cwd(), 'db', 'migrations', '001_init.sql');
    await sql.unsafe(readFileSync(migrationPath, 'utf-8'));
    const migrationPath2 = path.join(process.cwd(), 'db', 'migrations', '002_full_schema.sql');
    await sql.unsafe(readFileSync(migrationPath2, 'utf-8'));

    const users = [
      { id: 'u1', email: 'customer@fresh.com', password: await hash('123456'), name: 'John Doe', role: 'customer', avatar: 'JD', phone: '+84 90 123 4567', address: '123 Nguyen Hue, D1, HCMC', join_date: '2025-01-15', last_active: '2026-05-15', status: 'active', green_points: 1250, food_rescued: 12.5, co2_reduced: 45.2, total_orders: 28, total_spent: 850000, wallet_balance: 1500000 },
      { id: 'u2', email: 'partner@fresh.com', password: await hash('123456'), name: 'WinMart+ D1', role: 'partner', avatar: 'W', phone: '028 3822 1234', address: '123 Nguyen Hue, D1, HCMC', join_date: '2024-06-01', last_active: '2026-05-15', status: 'active', wallet_balance: 5000000 },
      { id: 'u3', email: 'freshadmin@gmail.com', password: await hash('AdminFresh@'), name: 'Super Admin', role: 'admin', avatar: 'SA', join_date: '2024-01-01', last_active: '2026-05-16', status: 'active' },
      { id: 'u4', email: 'jane@fresh.com', password: await hash('123456'), name: 'Jane Smith', role: 'customer', avatar: 'JS', phone: '+84 91 234 5678', join_date: '2025-03-20', last_active: '2026-05-14', status: 'active', green_points: 890, food_rescued: 8.3, co2_reduced: 32.1, total_orders: 15, total_spent: 420000, wallet_balance: 300000 },
      { id: 'u5', email: 'circlek@fresh.com', password: await hash('123456'), name: 'Circle K D3', role: 'partner', avatar: 'CK', phone: '028 3930 5678', join_date: '2024-08-15', last_active: '2026-05-15', status: 'active', wallet_balance: 2000000 },
      { id: 'u6', email: 'bob@fresh.com', password: await hash('123456'), name: 'Bob Wilson', role: 'customer', avatar: 'BW', phone: '+84 92 345 6789', join_date: '2025-06-10', last_active: '2026-05-10', status: 'suspended', green_points: 120, food_rescued: 1.2, co2_reduced: 4.5, total_orders: 3, total_spent: 85000, wallet_balance: 50000 },
      { id: 'u7', email: 'aeon@fresh.com', password: await hash('123456'), name: 'AEON Mall Binh Tan', role: 'partner', avatar: 'AE', phone: '028 3756 7890', join_date: '2024-03-01', last_active: '2026-05-15', status: 'active', wallet_balance: 8000000 },
      { id: 'u8', email: 'alice@fresh.com', password: await hash('123456'), name: 'Alice Chen', role: 'customer', avatar: 'AC', phone: '+84 93 456 7890', join_date: '2025-09-01', last_active: '2026-05-13', status: 'active', green_points: 2100, food_rescued: 25.8, co2_reduced: 98.5, total_orders: 52, total_spent: 1500000, wallet_balance: 2500000 },
      { id: 'u9', email: 'spammer@fresh.com', password: await hash('123456'), name: 'Spam Account', role: 'customer', avatar: 'SP', join_date: '2026-05-10', last_active: '2026-05-10', status: 'banned', wallet_balance: 0 },
      { id: 'u10', email: 'coopmart@fresh.com', password: await hash('123456'), name: 'Co.opmart D7', role: 'partner', avatar: 'CM', phone: '028 5412 3456', join_date: '2024-01-15', last_active: '2026-05-15', status: 'active', wallet_balance: 3500000 },
    ];
    for (const u of users) await sql`INSERT INTO users ${sql(u)} ON CONFLICT (id) DO NOTHING`;

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
    for (const s of stores) await sql`INSERT INTO stores ${sql(s)} ON CONFLICT (id) DO NOTHING`;

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
    for (const p of products) await sql`INSERT INTO products ${sql(p)} ON CONFLICT (id) DO NOTHING`;

    const vouchers = [
      { id: 'v1', code: 'WELCOME50', title: 'Chào mừng 50%', description: 'Giảm 50% cho đơn đầu tiên', discount_type: 'percentage', discount_value: 50, min_order: 50000, max_discount: 50000, usage_limit: 1, valid_from: '2026-01-01', valid_until: '2026-12-31', status: 'active', created_at: '2026-01-01', image: '🎉' },
      { id: 'v2', code: 'GREEN25', title: 'Green Credit 25%', description: 'Giảm 25% cho đơn hàng xanh', discount_type: 'percentage', discount_value: 25, min_order: 30000, max_discount: 30000, usage_limit: 10, valid_from: '2026-01-01', valid_until: '2026-12-31', status: 'active', created_at: '2026-01-01', image: '🌱' },
      { id: 'v3', code: 'FREESHIP', title: 'Miễn phí vận chuyển', description: 'Miễn phí ship cho đơn từ 100k', discount_type: 'fixed', discount_value: 15000, min_order: 100000, usage_limit: 5, valid_from: '2026-01-01', valid_until: '2026-12-31', status: 'active', created_at: '2026-01-01', image: '🚚' },
    ];
    for (const v of vouchers) await sql`INSERT INTO vouchers ${sql(v)} ON CONFLICT (id) DO NOTHING`;

    await sql`INSERT INTO user_vouchers ${sql({ user_id: 'u1', voucher_id: 'v1', claimed_at: '2026-05-01' })} ON CONFLICT DO NOTHING`;
    await sql`INSERT INTO user_vouchers ${sql({ user_id: 'u1', voucher_id: 'v2', claimed_at: '2026-05-05' })} ON CONFLICT DO NOTHING`;
    await sql`INSERT INTO user_vouchers ${sql({ user_id: 'u8', voucher_id: 'v2', claimed_at: '2026-05-10' })} ON CONFLICT DO NOTHING`;

    await sql`INSERT INTO favorites ${sql({ user_id: 'u1', product_id: 'p2', created_at: '2026-05-10' })} ON CONFLICT DO NOTHING`;
    await sql`INSERT INTO favorites ${sql({ user_id: 'u1', product_id: 'p5', created_at: '2026-05-11' })} ON CONFLICT DO NOTHING`;
    await sql`INSERT INTO favorites ${sql({ user_id: 'u8', product_id: 'p7', created_at: '2026-05-12' })} ON CONFLICT DO NOTHING`;

    const campaigns = [
      { id: 'c1', title: 'Flash Sale Giữa Tháng', description: 'Giảm đến 70% thực phẩm sắp hết hạn', type: 'flash_sale', status: 'active', discount_rate: 70, budget: 10000000, spent: 3400000, start_date: '2026-05-01', end_date: '2026-05-31', created_at: '2026-04-25', store_id: null, image: null, target_impressions: 50000, target_conversions: 2000, actual_impressions: 28400, actual_conversions: 1234 },
      { id: 'c2', title: 'ESG Tháng 5', description: 'X2 Green Credit cho mọi đơn hàng', type: 'esg', status: 'active', discount_rate: null, budget: 5000000, spent: 1200000, start_date: '2026-05-01', end_date: '2026-05-31', created_at: '2026-04-20', store_id: null, image: null, target_impressions: 30000, target_conversions: 1500, actual_impressions: 19200, actual_conversions: 876 },
      { id: 'c3', title: 'Combo Tiết Kiệm', description: 'Giảm thêm 15% khi mua combo 3 món', type: 'bundle', status: 'active', discount_rate: 15, budget: 3000000, spent: 850000, start_date: '2026-05-10', end_date: '2026-06-10', created_at: '2026-05-05', store_id: 's1', image: null, target_impressions: 20000, target_conversions: 800, actual_impressions: 8500, actual_conversions: 345 },
    ];
    for (const c of campaigns) await sql`INSERT INTO campaigns ${sql(c)} ON CONFLICT (id) DO NOTHING`;

    const banners = [
      { id: 'b1', title: 'Rescue Food, Save Planet!', subtitle: 'Giảm đến 70% thực phẩm ngon', image: '🌍', color: 'emerald', action_url: '/customer', active: true, priority: 5, created_at: '2026-05-01' },
      { id: 'b2', title: 'X2 Green Credits', subtitle: 'Tuần lễ xanh - Nhân đôi điểm thưởng', image: '💚', color: 'green', action_url: '/customer/impact', active: true, priority: 4, created_at: '2026-05-01' },
      { id: 'b3', title: 'Đối tác mới - Quà tặng 500K', subtitle: 'Đăng ký ngay để nhận ưu đãi', image: '🎁', color: 'orange', action_url: '/partner', active: true, priority: 3, created_at: '2026-05-01' },
    ];
    for (const b of banners) await sql`INSERT INTO banners ${sql(b)} ON CONFLICT (id) DO NOTHING`;

    for (let d = 1; d <= 30; d++) {
      const date = `2026-05-${String(d).padStart(2, '0')}`;
      await sql`INSERT INTO esg_metrics ${sql({
        date, food_rescued_kg: Math.round(80 + Math.random() * 120),
        co2_reduced_kg: Math.round(200 + Math.random() * 300),
        meals_saved: Math.round(150 + Math.random() * 250),
        water_saved_l: Math.round(500 + Math.random() * 1000),
        trees_equivalent: Math.round(10 + Math.random() * 20),
        active_partners: 240 + Math.round(Math.random() * 20),
        active_customers: 5800 + Math.round(Math.random() * 400),
        total_orders: 650 + Math.round(Math.random() * 200),
      })} ON CONFLICT (date) DO NOTHING`;
    }

    const tiers = [
      { id: 't1', name: 'Bronze', min_points: 0, max_points: 499, color: 'amber-600', icon: '🥉', benefits: 'Basic rescue access', multiplier: 1.0 },
      { id: 't2', name: 'Silver', min_points: 500, max_points: 1499, color: 'gray-400', icon: '🥈', benefits: 'Priority notifications, 1.5x points', multiplier: 1.5 },
      { id: 't3', name: 'Gold', min_points: 1500, max_points: 4999, color: 'yellow-500', icon: '🥇', benefits: 'Free delivery, 2x points', multiplier: 2.0 },
      { id: 't4', name: 'Platinum', min_points: 5000, max_points: 999999, color: 'purple-600', icon: '💎', benefits: 'All perks + exclusive deals', multiplier: 3.0 },
    ];
    for (const t of tiers) await sql`INSERT INTO gamification_tiers ${sql(t)} ON CONFLICT (id) DO NOTHING`;

    const badges = [
      { id: 'bg1', name: 'First Rescue', description: 'Rescue your first food item', icon: '🛟', category: 'rescue', threshold: 1, tier_id: 't1' },
      { id: 'bg2', name: 'Eco Warrior', description: 'Rescue 50 items', icon: '🌱', category: 'rescue', threshold: 50, tier_id: 't3' },
      { id: 'bg3', name: 'CO2 Slayer', description: 'Save 100kg CO2', icon: '🌍', category: 'esg', threshold: 100, tier_id: 't3' },
      { id: 'bg4', name: 'Green Hero', description: 'Reach 10k green points', icon: '🏆', category: 'milestone', threshold: 10000, tier_id: 't4' },
      { id: 'bg5', name: 'Social Butterfly', description: 'Share 10 deals', icon: '🦋', category: 'social', threshold: 10, tier_id: 't2' },
      { id: 'bg6', name: 'Night Owl', description: 'Rescue after 10PM', icon: '🦉', category: 'special', threshold: 1, tier_id: 't1' },
    ];
    for (const b of badges) await sql`INSERT INTO gamification_badges ${sql(b)} ON CONFLICT (id) DO NOTHING`;

    await sql`INSERT INTO user_badges ${sql({ user_id: 'u1', badge_id: 'bg1', earned_at: '2026-05-01' })} ON CONFLICT DO NOTHING`;
    await sql`INSERT INTO user_badges ${sql({ user_id: 'u1', badge_id: 'bg2', earned_at: '2026-05-10' })} ON CONFLICT DO NOTHING`;
    await sql`INSERT INTO user_badges ${sql({ user_id: 'u1', badge_id: 'bg3', earned_at: '2026-05-12' })} ON CONFLICT DO NOTHING`;
    await sql`INSERT INTO user_badges ${sql({ user_id: 'u1', badge_id: 'bg6', earned_at: '2026-05-14' })} ON CONFLICT DO NOTHING`;
    await sql`INSERT INTO user_badges ${sql({ user_id: 'u8', badge_id: 'bg1', earned_at: '2026-04-20' })} ON CONFLICT DO NOTHING`;
    await sql`INSERT INTO user_badges ${sql({ user_id: 'u8', badge_id: 'bg3', earned_at: '2026-05-08' })} ON CONFLICT DO NOTHING`;

    const missions = [
      { id: 'm1', title: 'Rescue 3 items', description: 'Rescue 3 food items today', type: 'daily', requirement_type: 'rescue_count', requirement_value: 3, points_reward: 100, icon: '🛒', active: true, created_at: '2026-05-01' },
      { id: 'm2', title: 'Save 5kg CO2', description: 'Save 5kg of CO2 today', type: 'daily', requirement_type: 'co2_saved', requirement_value: 5, points_reward: 150, icon: '🌍', active: true, created_at: '2026-05-01' },
      { id: 'm3', title: 'Weekly Rescuer', description: 'Rescue 15 items this week', type: 'weekly', requirement_type: 'rescue_count', requirement_value: 15, points_reward: 500, icon: '📦', active: true, created_at: '2026-05-01' },
      { id: 'm4', title: 'Eco Champion', description: 'Save 50kg CO2 this month', type: 'monthly', requirement_type: 'co2_saved', requirement_value: 50, points_reward: 2000, icon: '🏆', active: true, created_at: '2026-05-01' },
    ];
    for (const m of missions) await sql`INSERT INTO gamification_missions ${sql(m)} ON CONFLICT (id) DO NOTHING`;

    const rolePermissions = [
      { id: 'r1', role_name: 'Super Admin', description: 'Full system access', permissions: JSON.stringify(['all']), created_at: '2026-01-01' },
      { id: 'r2', role_name: 'Admin', description: 'Administrative access', permissions: JSON.stringify(['users.read', 'users.write', 'partners.read', 'partners.write', 'orders.read', 'orders.write', 'system.read']), created_at: '2026-01-01' },
      { id: 'r3', role_name: 'Moderator', description: 'Content moderation', permissions: JSON.stringify(['users.read', 'partners.read', 'orders.read', 'reports.read']), created_at: '2026-01-01' },
    ];
    for (const r of rolePermissions) await sql`INSERT INTO role_permissions ${sql(r)} ON CONFLICT (id) DO NOTHING`;

    const staffMembers = [
      { id: 'st1', store_id: 's1', name: 'Nguyen Van A', email: 'a@winmart.com', phone: '0901234567', role: 'manager', permissions: JSON.stringify(['all']), status: 'active', created_at: '2026-01-01' },
      { id: 'st2', store_id: 's1', name: 'Tran Thi B', email: 'b@winmart.com', phone: '0901234568', role: 'staff', permissions: JSON.stringify(['scan', 'inventory']), status: 'active', created_at: '2026-02-01' },
    ];
    for (const s of staffMembers) await sql`INSERT INTO staff_members ${sql(s)} ON CONFLICT (id) DO NOTHING`;

    const commissionRates = [
      { id: 'cr1', name: 'Standard', rate: 15.0, type: 'percentage', min_order: 0, max_cap: 500000, active: true, created_at: '2026-01-01', updated_at: '2026-01-01' },
      { id: 'cr2', name: 'Premium', rate: 12.0, type: 'percentage', min_order: 1000000, max_cap: 1000000, active: true, created_at: '2026-01-01', updated_at: '2026-01-01' },
    ];
    for (const c of commissionRates) await sql`INSERT INTO commission_rates ${sql(c)} ON CONFLICT (id) DO NOTHING`;

    const districts = [
      { district: 'District 1', coverage_pct: 95, total_stores: 45, active_stores: 42, total_orders: 15800, food_rescued_kg: 28400, population_reached: 450000, updated_at: '2026-05-15' },
      { district: 'District 7', coverage_pct: 80, total_stores: 32, active_stores: 28, total_orders: 12400, food_rescued_kg: 19800, population_reached: 320000, updated_at: '2026-05-15' },
      { district: 'District 2', coverage_pct: 65, total_stores: 24, active_stores: 20, total_orders: 8900, food_rescued_kg: 14200, population_reached: 250000, updated_at: '2026-05-15' },
      { district: 'Binh Thanh', coverage_pct: 50, total_stores: 18, active_stores: 15, total_orders: 5600, food_rescued_kg: 9800, population_reached: 180000, updated_at: '2026-05-15' },
      { district: 'Tan Binh', coverage_pct: 35, total_stores: 12, active_stores: 10, total_orders: 3400, food_rescued_kg: 6200, population_reached: 120000, updated_at: '2026-05-15' },
    ];
    for (const d of districts) await sql`INSERT INTO district_coverage ${sql(d)} ON CONFLICT (district) DO NOTHING`;

    const wasteHotspots = [
      { id: 'wh1', district: 'District 1', ward: 'Ben Thanh', latitude: 10.7724, longitude: 106.6983, waste_amount: 450, food_type: 'Prepared meals', frequency: 'daily', severity: 'high', notes: 'Near Ben Thanh market', created_at: '2026-05-01' },
      { id: 'wh2', district: 'District 1', ward: 'Nguyen Hue', latitude: 10.7734, longitude: 106.7037, waste_amount: 320, food_type: 'Bakery', frequency: 'daily', severity: 'medium', created_at: '2026-05-01' },
      { id: 'wh3', district: 'Binh Thanh', ward: 'Ward 22', latitude: 10.8011, longitude: 106.7128, waste_amount: 280, food_type: 'Mixed', frequency: 'weekly', severity: 'medium', created_at: '2026-05-01' },
    ];
    for (const w of wasteHotspots) await sql`INSERT INTO waste_hotspots ${sql(w)} ON CONFLICT (id) DO NOTHING`;

    const integrations = [
      { id: 'int1', store_id: 's1', name: 'POS System', type: 'pos', status: 'connected', config: JSON.stringify({ vendor: 'NCR', version: '3.2' }), connected_at: '2026-01-15', last_sync_at: '2026-05-15' },
      { id: 'int2', store_id: 's1', name: 'Delivery Partner', type: 'delivery', status: 'connected', config: JSON.stringify({ provider: 'GrabExpress' }), connected_at: '2026-02-01', last_sync_at: '2026-05-15' },
    ];
    for (const i of integrations) await sql`INSERT INTO integrations ${sql(i)} ON CONFLICT (id) DO NOTHING`;

    const systemHealth = [
      { component: 'AI Engine', status: 'healthy', metric_name: 'Load', metric_value: '42%', ping_ms: 45, uptime_pct: 99.97, checked_at: '2026-05-15' },
      { component: 'Database Cluster', status: 'healthy', metric_name: 'Response', metric_value: '12ms', ping_ms: 12, uptime_pct: 100, checked_at: '2026-05-15' },
      { component: 'CDN Edge', status: 'high_load', metric_name: 'Latency', metric_value: '120ms', ping_ms: 120, uptime_pct: 99.2, checked_at: '2026-05-15' },
      { component: 'Fraud Scanner', status: 'healthy', metric_name: 'Processed', metric_value: '15.4k', ping_ms: 80, uptime_pct: 99.95, checked_at: '2026-05-15' },
      { component: 'API Gateway', status: 'healthy', metric_name: 'Rate', metric_value: '240 req/s', ping_ms: 18, uptime_pct: 99.99, checked_at: '2026-05-15' },
      { component: 'Storage Bucket', status: 'warning', metric_name: 'Usage', metric_value: '72%', ping_ms: 65, uptime_pct: 99.8, checked_at: '2026-05-15' },
    ];
    for (const h of systemHealth) await sql`INSERT INTO system_health ${sql(h)} ON CONFLICT DO NOTHING`;

    const forecastingRows = [];
    for (let h = 0; h < 48; h++) {
      const hour = h % 24;
      const day = 15 + Math.floor(h / 24);
      const demand = Math.round(40 + Math.random() * 80 + (hour >= 11 && hour <= 13 ? 40 : 0) + (hour >= 17 && hour <= 19 ? 50 : 0) - (hour >= 23 || hour <= 5 ? 30 : 0));
      forecastingRows.push({
        date: `2026-05-${String(day).padStart(2, '0')}`, hour, predicted_demand: demand,
        actual_demand: Math.round(demand * (0.8 + Math.random() * 0.4)), confidence: 0.75 + Math.random() * 0.2, model_version: 'v2.3', store_id: 's1',
        created_at: '2026-05-14',
      });
    }
    for (const f of forecastingRows) await sql`INSERT INTO forecasting_data ${sql(f)} ON CONFLICT DO NOTHING`;

    const pointsHistory = [
      { user_id: 'u1', points: 50, type: 'earned', source: 'rescue', reference_id: 'p1', description: 'Rescued Bánh Mì Gà', created_at: '2026-05-14T08:00:00Z' },
      { user_id: 'u1', points: 100, type: 'earned', source: 'mission', reference_id: 'm1', description: 'Completed: Rescue 3 items', created_at: '2026-05-14T09:00:00Z' },
      { user_id: 'u1', points: 200, type: 'earned', source: 'referral', description: 'Referred a friend', created_at: '2026-05-13T10:00:00Z' },
      { user_id: 'u1', points: 50, type: 'spent', source: 'voucher', reference_id: 'v1', description: 'Redeemed voucher WELCOME50', created_at: '2026-05-12T11:00:00Z' },
    ];
    for (const p of pointsHistory) await sql`INSERT INTO points_history ${sql(p)} ON CONFLICT DO NOTHING`;

    console.log('All seed data inserted successfully');
  } catch (err) { console.error('Seed failed:', err); process.exit(1); }
  finally { await sql.end(); }
}

run();
