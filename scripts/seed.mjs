import { createClient } from '@supabase/supabase-js';

const URL = 'https://ktnhoiqqecygxztsugkx.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0bmhvaXFxZWN5Z3h6dHN1Z2t4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA3MzEyMywiZXhwIjoyMDk0NjQ5MTIzfQ.gfeY57zD2DqZw857wMTF8H0rgcexw6dElvAA-fVfhhk';
const supabase = createClient(URL, KEY);

const now = new Date();
const day = (n) => new Date(now.getTime() + n * 86400000).toISOString();

const USERS = [
  { id: 'u1', email: 'minh@email.com', password: '123456', name: 'Minh Trần', role: 'customer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=minh', phone: '0901234567', address: 'Quận 1, HCM', join_date: day(-180), last_active: day(0), status: 'active', green_points: 2100, food_rescued: 45.5, co2_reduced: 120.3, total_orders: 34, total_spent: 8200000, wallet_balance: 250000 },
  { id: 'u2', email: 'lan@email.com', password: '123456', name: 'Lan Nguyễn', role: 'partner', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lan', phone: '0907654321', address: 'Quận 2, HCM', join_date: day(-365), last_active: day(0), status: 'active', green_points: 890, food_rescued: 230, co2_reduced: 580, total_orders: 0, total_spent: 0, wallet_balance: 15000000 },
  { id: 'u3', email: 'hieu@email.com', password: '123456', name: 'Hiếu Phạm', role: 'admin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hieu', phone: '0912345678', address: 'Quận 3, HCM', join_date: day(-540), last_active: day(0), status: 'active', green_points: 5000, food_rescued: 0, co2_reduced: 0, total_orders: 0, total_spent: 0, wallet_balance: 50000000 },
  { id: 'u4', email: 'thao@email.com', password: '123456', name: 'Thảo Lê', role: 'customer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=thao', phone: '0934567890', address: 'Quận Bình Thạnh, HCM', join_date: day(-90), last_active: day(-1), status: 'active', green_points: 1250, food_rescued: 28.2, co2_reduced: 75.5, total_orders: 18, total_spent: 4300000, wallet_balance: 180000 },
  { id: 'u5', email: 'duy@email.com', password: '123456', name: 'Duy Hoàng', role: 'customer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=duy', phone: '0945678901', address: 'Quận 7, HCM', join_date: day(-45), last_active: day(0), status: 'active', green_points: 450, food_rescued: 12.8, co2_reduced: 34.2, total_orders: 8, total_spent: 1950000, wallet_balance: 95000 },
  { id: 'u6', email: 'anh@email.com', password: '123456', name: 'Anh Đặng', role: 'partner', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=anh', phone: '0956789012', address: 'Quận Tân Bình, HCM', join_date: day(-300), last_active: day(-2), status: 'active', green_points: 1500, food_rescued: 0, co2_reduced: 0, total_orders: 0, total_spent: 0, wallet_balance: 25000000 },
  { id: 'u7', email: 'mai@email.com', password: '123456', name: 'Mai Vũ', role: 'customer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mai', phone: '0967890123', address: 'Quận 5, HCM', join_date: day(-20), last_active: day(0), status: 'active', green_points: 150, food_rescued: 5.3, co2_reduced: 14.1, total_orders: 3, total_spent: 720000, wallet_balance: 45000 },
];

const STORES = [
  { id: 's1', name: 'WinMart+', address: 'Số 1 Nguyễn Huệ, Quận 1', phone: '02838223344', rating: 4.5, review_count: 1250, is_open: true, open_hours: '06:00-23:00', distance: 0.8, deals_count: 12, image: 'https://picsum.photos/seed/winmart/400/300', since: '2022-06-01' },
  { id: 's2', name: 'GS25', address: '65 Lê Lợi, Quận 1', phone: '02838225566', rating: 4.2, review_count: 890, is_open: true, open_hours: '00:00-24:00', distance: 1.2, deals_count: 8, image: 'https://picsum.photos/seed/gs25/400/300', since: '2023-01-15' },
  { id: 's3', name: 'Circle K', address: '180 Nguyễn Đình Chiểu, Quận 3', phone: '02839334455', rating: 4.0, review_count: 670, is_open: true, open_hours: '00:00-24:00', distance: 1.5, deals_count: 6, image: 'https://picsum.photos/seed/circle/400/300', since: '2022-09-01' },
  { id: 's4', name: 'AEON Mall', address: 'Tân Phú, HCM', phone: '02837626688', rating: 4.7, review_count: 2100, is_open: true, open_hours: '09:00-22:00', distance: 5.2, deals_count: 25, image: 'https://picsum.photos/seed/aeon/400/300', since: '2021-11-01' },
  { id: 's5', name: 'Co.opmart', address: '190 Cống Quỳnh, Quận 1', phone: '02839223344', rating: 4.3, review_count: 1560, is_open: true, open_hours: '07:00-22:00', distance: 2.1, deals_count: 15, image: 'https://picsum.photos/seed/coop/400/300', since: '2022-03-01' },
  { id: 's6', name: 'FamilyMart', address: '39 Nguyễn Trãi, Quận 5', phone: '02838334455', rating: 4.1, review_count: 780, is_open: true, open_hours: '00:00-24:00', distance: 2.5, deals_count: 9, image: 'https://picsum.photos/seed/family/400/300', since: '2023-04-01' },
  { id: 's7', name: 'Lotte Mart', address: 'Nam Kỳ Khởi Nghĩa, Quận 3', phone: '02839332211', rating: 4.4, review_count: 1340, is_open: true, open_hours: '08:00-22:00', distance: 3.8, deals_count: 18, image: 'https://picsum.photos/seed/lotte/400/300', since: '2022-08-01' },
  { id: 's8', name: 'MM Mega Market', address: 'Quốc Lộ 13, Bình Thạnh', phone: '02835556677', rating: 4.0, review_count: 560, is_open: true, open_hours: '06:00-21:00', distance: 6.5, deals_count: 10, image: 'https://picsum.photos/seed/mm/400/300', since: '2023-06-01' },
];

const CATEGORIES = ['Bakery', 'Fast Food', 'Vegetables', 'Fruits', 'Frozen', 'Beverages', 'Dairy', 'Meals', 'Snacks', 'Produce'];

const PRODUCTS = [
  { id: 'p1', name: 'Bánh mì baguette', category: 'Bakery', stock: 8, original_price: 35000, ai_price: 12000, expiry: day(1), status: 'live', image: 'https://picsum.photos/seed/bread1/400/300', store_id: 's1', store_name: 'WinMart+', discount: 66, created_at: day(-2), rating: 4.5, review_count: 23, co2_saved: 0.5, rescued_score: 85, ingredients: JSON.stringify(['Bột mì', 'Men', 'Muối']), allergens: JSON.stringify(['Gluten']), nutrition: JSON.stringify({ calories: 250, protein: 8, carbs: 45, fat: 2, fiber: 3 }), distance: 0.8 },
  { id: 'p2', name: 'Croissant bơ', category: 'Bakery', stock: 5, original_price: 45000, ai_price: 15000, expiry: day(1), status: 'live', image: 'https://picsum.photos/seed/croissant/400/300', store_id: 's1', store_name: 'WinMart+', discount: 67, created_at: day(-1), rating: 4.8, review_count: 15, co2_saved: 0.3, rescued_score: 90, ingredients: JSON.stringify(['Bột mì', 'Bơ', 'Trứng']), allergens: JSON.stringify(['Gluten', 'Egg']), nutrition: JSON.stringify({ calories: 320, protein: 6, carbs: 35, fat: 18, fiber: 1 }), distance: 0.8 },
  { id: 'p3', name: 'Cơm gà sốt teriyaki', category: 'Meals', stock: 3, original_price: 65000, ai_price: 25000, expiry: day(1), status: 'live', image: 'https://picsum.photos/seed/chicken/400/300', store_id: 's2', store_name: 'GS25', discount: 62, created_at: day(-1), rating: 4.3, review_count: 42, co2_saved: 0.8, rescued_score: 78, ingredients: JSON.stringify(['Cơm', 'Gà', 'Sốt teriyaki', 'Rau củ']), allergens: JSON.stringify(['Soy']), nutrition: JSON.stringify({ calories: 580, protein: 35, carbs: 65, fat: 15, fiber: 2 }), distance: 1.2 },
  { id: 'p4', name: 'Mì cay Hàn Quốc', category: 'Fast Food', stock: 10, original_price: 28000, ai_price: 9000, expiry: day(2), status: 'live', image: 'https://picsum.photos/seed/ramen/400/300', store_id: 's2', store_name: 'GS25', discount: 68, created_at: day(-1), rating: 4.1, review_count: 67, co2_saved: 0.2, rescued_score: 82, ingredients: JSON.stringify(['Mì', 'Tương ớt', 'Rau khô']), allergens: JSON.stringify(['Gluten', 'Soy']), nutrition: JSON.stringify({ calories: 420, protein: 10, carbs: 72, fat: 12, fiber: 1 }), distance: 1.2 },
  { id: 'p5', name: 'Sữa tươi trân châu', category: 'Beverages', stock: 15, original_price: 32000, ai_price: 11000, expiry: day(1), status: 'live', image: 'https://picsum.photos/seed/milktea/400/300', store_id: 's3', store_name: 'Circle K', discount: 66, created_at: day(0), rating: 4.6, review_count: 38, co2_saved: 0.3, rescued_score: 88, ingredients: JSON.stringify(['Sữa tươi', 'Trân châu', 'Đường']), allergens: JSON.stringify(['Dairy']), nutrition: JSON.stringify({ calories: 350, protein: 8, carbs: 55, fat: 10, fiber: 0 }), distance: 1.5 },
  { id: 'p6', name: 'Bánh mì que (gói 10)', category: 'Bakery', stock: 20, original_price: 25000, ai_price: 7000, expiry: day(2), status: 'live', image: 'https://picsum.photos/seed/breadstick/400/300', store_id: 's3', store_name: 'Circle K', discount: 72, created_at: day(-2), rating: 4.0, review_count: 56, co2_saved: 0.1, rescued_score: 75, ingredients: JSON.stringify(['Bột mì', 'Bơ', 'Muối']), allergens: JSON.stringify(['Gluten']), nutrition: JSON.stringify({ calories: 120, protein: 3, carbs: 20, fat: 4, fiber: 1 }), distance: 1.5 },
  { id: 'p7', name: 'Rau xà lách hữu cơ', category: 'Vegetables', stock: 7, original_price: 40000, ai_price: 15000, expiry: day(1), status: 'live', image: 'https://picsum.photos/seed/salad/400/300', store_id: 's4', store_name: 'AEON Mall', discount: 63, created_at: day(0), rating: 4.4, review_count: 29, co2_saved: 0.4, rescued_score: 80, ingredients: JSON.stringify(['Xà lách']), allergens: JSON.stringify([]), nutrition: JSON.stringify({ calories: 15, protein: 1, carbs: 3, fat: 0, fiber: 2 }), distance: 5.2 },
  { id: 'p8', name: 'Trái cây mix (tray)', category: 'Fruits', stock: 4, original_price: 85000, ai_price: 35000, expiry: day(1), status: 'live', image: 'https://picsum.photos/seed/fruits/400/300', store_id: 's4', store_name: 'AEON Mall', discount: 59, created_at: day(0), rating: 4.7, review_count: 18, co2_saved: 0.6, rescued_score: 86, ingredients: JSON.stringify(['Dâu', 'Kiwi', 'Cam', 'Táo']), allergens: JSON.stringify([]), nutrition: JSON.stringify({ calories: 120, protein: 2, carbs: 28, fat: 1, fiber: 6 }), distance: 5.2 },
  { id: 'p9', name: 'Cơm tấm sườn bì', category: 'Meals', stock: 2, original_price: 55000, ai_price: 22000, expiry: day(1), status: 'live', image: 'https://picsum.photos/seed/comtam/400/300', store_id: 's5', store_name: 'Co.opmart', discount: 60, created_at: day(-1), rating: 4.6, review_count: 89, co2_saved: 0.7, rescued_score: 92, ingredients: JSON.stringify(['Cơm', 'Sườn', 'Bì', 'Trứng']), allergens: JSON.stringify(['Egg', 'Soy']), nutrition: JSON.stringify({ calories: 620, protein: 38, carbs: 70, fat: 18, fiber: 1 }), distance: 2.1 },
  { id: 'p10', name: 'Nước cam ép', category: 'Beverages', stock: 12, original_price: 35000, ai_price: 12000, expiry: day(1), status: 'live', image: 'https://picsum.photos/seed/orangejuice/400/300', store_id: 's5', store_name: 'Co.opmart', discount: 66, created_at: day(0), rating: 4.3, review_count: 45, co2_saved: 0.2, rescued_score: 77, ingredients: JSON.stringify(['Cam tươi']), allergens: JSON.stringify([]), nutrition: JSON.stringify({ calories: 160, protein: 2, carbs: 36, fat: 0, fiber: 1 }), distance: 2.1 },
  { id: 'p11', name: 'Kem vanila (hộp)', category: 'Frozen', stock: 6, original_price: 48000, ai_price: 18000, expiry: day(3), status: 'live', image: 'https://picsum.photos/seed/icecream/400/300', store_id: 's6', store_name: 'FamilyMart', discount: 63, created_at: day(-2), rating: 4.2, review_count: 34, co2_saved: 0.3, rescued_score: 73, ingredients: JSON.stringify(['Kem sữa', 'Vanila', 'Đường']), allergens: JSON.stringify(['Dairy']), nutrition: JSON.stringify({ calories: 290, protein: 4, carbs: 32, fat: 16, fiber: 0 }), distance: 2.5 },
  { id: 'p12', name: 'Khoai tây chiên', category: 'Frozen', stock: 18, original_price: 35000, ai_price: 10000, expiry: day(5), status: 'live', image: 'https://picsum.photos/seed/fries/400/300', store_id: 's6', store_name: 'FamilyMart', discount: 71, created_at: day(-3), rating: 3.9, review_count: 72, co2_saved: 0.2, rescued_score: 70, ingredients: JSON.stringify(['Khoai tây', 'Dầu thực vật']), allergens: JSON.stringify([]), nutrition: JSON.stringify({ calories: 380, protein: 5, carbs: 42, fat: 22, fiber: 3 }), distance: 2.5 },
  { id: 'p13', name: 'Pizza pepperoni', category: 'Meals', stock: 1, original_price: 120000, ai_price: 45000, expiry: day(1), status: 'live', image: 'https://picsum.photos/seed/pizza/400/300', store_id: 's7', store_name: 'Lotte Mart', discount: 63, created_at: day(0), rating: 4.5, review_count: 95, co2_saved: 1.2, rescued_score: 94, ingredients: JSON.stringify(['Bột pizza', 'Pepperoni', 'Phô mai', 'Sốt cà']), allergens: JSON.stringify(['Gluten', 'Dairy']), nutrition: JSON.stringify({ calories: 850, protein: 40, carbs: 80, fat: 38, fiber: 2 }), distance: 3.8 },
  { id: 'p14', name: 'Sữa chua Hy Lạp', category: 'Dairy', stock: 24, original_price: 22000, ai_price: 8000, expiry: day(2), status: 'live', image: 'https://picsum.photos/seed/yogurt/400/300', store_id: 's7', store_name: 'Lotte Mart', discount: 64, created_at: day(-1), rating: 4.4, review_count: 41, co2_saved: 0.2, rescued_score: 81, ingredients: JSON.stringify(['Sữa', 'Men sữa chua']), allergens: JSON.stringify(['Dairy']), nutrition: JSON.stringify({ calories: 140, protein: 12, carbs: 8, fat: 6, fiber: 0 }), distance: 3.8 },
  { id: 'p15', name: 'Snack khoai tây (gói lớn)', category: 'Snacks', stock: 30, original_price: 28000, ai_price: 9000, expiry: day(10), status: 'live', image: 'https://picsum.photos/seed/chips/400/300', store_id: 's8', store_name: 'MM Mega Market', discount: 68, created_at: day(-5), rating: 4.0, review_count: 112, co2_saved: 0.1, rescued_score: 68, ingredients: JSON.stringify(['Khoai tây', 'Dầu', 'Muối']), allergens: JSON.stringify([]), nutrition: JSON.stringify({ calories: 260, protein: 3, carbs: 30, fat: 15, fiber: 2 }), distance: 6.5 },
  { id: 'p16', name: 'Bánh bông lan cuộn', category: 'Bakery', stock: 4, original_price: 38000, ai_price: 14000, expiry: day(1), status: 'live', image: 'https://picsum.photos/seed/cake/400/300', store_id: 's1', store_name: 'WinMart+', discount: 63, created_at: day(0), rating: 4.6, review_count: 27, co2_saved: 0.3, rescued_score: 87, ingredients: JSON.stringify(['Bột mì', 'Trứng', 'Kem tươi']), allergens: JSON.stringify(['Gluten', 'Egg', 'Dairy']), nutrition: JSON.stringify({ calories: 380, protein: 6, carbs: 48, fat: 18, fiber: 1 }), distance: 0.8 },
  { id: 'p17', name: 'Cơm cuộn Hàn Quốc', category: 'Meals', stock: 0, original_price: 45000, ai_price: 18000, expiry: day(1), status: 'out_of_stock', image: 'https://picsum.photos/seed/kimbap/400/300', store_id: 's2', store_name: 'GS25', discount: 60, created_at: day(-3), rating: 4.2, review_count: 53, co2_saved: 0.5, rescued_score: 0, ingredients: JSON.stringify(['Cơm', 'Rong biển', 'Rau củ', 'Thịt']), allergens: JSON.stringify(['Soy']), nutrition: JSON.stringify({ calories: 450, protein: 18, carbs: 60, fat: 12, fiber: 3 }), distance: 1.2 },
  { id: 'p18', name: 'Dưa hấu (1/2 trái)', category: 'Fruits', stock: 2, original_price: 30000, ai_price: 12000, expiry: day(1), status: 'live', image: 'https://picsum.photos/seed/watermelon/400/300', store_id: 's4', store_name: 'AEON Mall', discount: 60, created_at: day(0), rating: 4.1, review_count: 15, co2_saved: 0.5, rescued_score: 79, ingredients: JSON.stringify(['Dưa hấu']), allergens: JSON.stringify([]), nutrition: JSON.stringify({ calories: 90, protein: 2, carbs: 22, fat: 0, fiber: 3 }), distance: 5.2 },
  { id: 'p19', name: 'Sữa hạt hạnh nhân', category: 'Beverages', stock: 9, original_price: 42000, ai_price: 16000, expiry: day(2), status: 'live', image: 'https://picsum.photos/seed/almondmilk/400/300', store_id: 's5', store_name: 'Co.opmart', discount: 62, created_at: day(-1), rating: 4.3, review_count: 31, co2_saved: 0.2, rescued_score: 76, ingredients: JSON.stringify(['Sữa hạnh nhân', 'Vitamin']), allergens: JSON.stringify(['Tree nuts']), nutrition: JSON.stringify({ calories: 80, protein: 3, carbs: 8, fat: 4, fiber: 1 }), distance: 2.1 },
  { id: 'p20', name: 'Xúc xích Đức (gói 5)', category: 'Fast Food', stock: 11, original_price: 55000, ai_price: 20000, expiry: day(2), status: 'live', image: 'https://picsum.photos/seed/sausage/400/300', store_id: 's6', store_name: 'FamilyMart', discount: 64, created_at: day(-2), rating: 4.0, review_count: 48, co2_saved: 0.4, rescued_score: 74, ingredients: JSON.stringify(['Thịt heo', 'Gia vị']), allergens: JSON.stringify([]), nutrition: JSON.stringify({ calories: 480, protein: 22, carbs: 6, fat: 42, fiber: 0 }), distance: 2.5 },
  { id: 'p21', name: 'Bánh mì sandwich', category: 'Bakery', stock: 0, original_price: 22000, ai_price: 7000, expiry: day(2), status: 'out_of_stock', image: 'https://picsum.photos/seed/sandwich/400/300', store_id: 's7', store_name: 'Lotte Mart', discount: 68, created_at: day(-4), rating: 3.8, review_count: 22, co2_saved: 0.1, rescued_score: 0, ingredients: JSON.stringify(['Bột mì', 'Men', 'Muối']), allergens: JSON.stringify(['Gluten']), nutrition: JSON.stringify({ calories: 200, protein: 6, carbs: 36, fat: 3, fiber: 2 }), distance: 3.8 },
  { id: 'p22', name: 'Rau cải bó xôi', category: 'Vegetables', stock: 6, original_price: 25000, ai_price: 9000, expiry: day(1), status: 'live', image: 'https://picsum.photos/seed/spinach/400/300', store_id: 's8', store_name: 'MM Mega Market', discount: 64, created_at: day(0), rating: 4.0, review_count: 11, co2_saved: 0.3, rescued_score: 72, ingredients: JSON.stringify(['Cải bó xôi']), allergens: JSON.stringify([]), nutrition: JSON.stringify({ calories: 23, protein: 3, carbs: 4, fat: 0, fiber: 2 }), distance: 6.5 },
  { id: 'p23', name: 'Cá hồi phi lê (200g)', category: 'Frozen', stock: 3, original_price: 150000, ai_price: 65000, expiry: day(1), status: 'live', image: 'https://picsum.photos/seed/salmon/400/300', store_id: 's4', store_name: 'AEON Mall', discount: 57, created_at: day(0), rating: 4.8, review_count: 63, co2_saved: 1.5, rescued_score: 91, ingredients: JSON.stringify(['Cá hồi']), allergens: JSON.stringify(['Fish']), nutrition: JSON.stringify({ calories: 420, protein: 40, carbs: 0, fat: 28, fiber: 0 }), distance: 5.2 },
  { id: 'p24', name: 'Nước ngọt Coca-Cola (lon)', category: 'Beverages', stock: 48, original_price: 10000, ai_price: 4000, expiry: day(30), status: 'live', image: 'https://picsum.photos/seed/coke/400/300', store_id: 's1', store_name: 'WinMart+', discount: 60, created_at: day(-7), rating: 3.5, review_count: 200, co2_saved: 0.05, rescued_score: 60, ingredients: JSON.stringify(['Nước', 'Đường', 'CO2']), allergens: JSON.stringify([]), nutrition: JSON.stringify({ calories: 140, protein: 0, carbs: 39, fat: 0, fiber: 0 }), distance: 0.8 },
  { id: 'p25', name: 'Thịt ba chỉ heo (500g)', category: 'Produce', stock: 5, original_price: 75000, ai_price: 30000, expiry: day(1), status: 'live', image: 'https://picsum.photos/seed/pork/400/300', store_id: 's5', store_name: 'Co.opmart', discount: 60, created_at: day(0), rating: 4.1, review_count: 37, co2_saved: 1.0, rescued_score: 84, ingredients: JSON.stringify(['Thịt heo']), allergens: JSON.stringify([]), nutrition: JSON.stringify({ calories: 650, protein: 35, carbs: 0, fat: 55, fiber: 0 }), distance: 2.1 },
  { id: 'p26', name: 'Bia Hà Nội (lon 330ml)', category: 'Beverages', stock: 24, original_price: 15000, ai_price: 6000, expiry: day(60), status: 'live', image: 'https://picsum.photos/seed/beer/400/300', store_id: 's3', store_name: 'Circle K', discount: 60, created_at: day(-10), rating: 3.8, review_count: 88, co2_saved: 0.1, rescued_score: 55, ingredients: JSON.stringify(['Nước', 'Malt', 'Hoa bia']), allergens: JSON.stringify(['Gluten']), nutrition: JSON.stringify({ calories: 150, protein: 1, carbs: 12, fat: 0, fiber: 0 }), distance: 1.5 },
  { id: 'p27', name: 'Táo đỏ nhập khẩu (1kg)', category: 'Fruits', stock: 0, original_price: 120000, ai_price: 55000, expiry: day(1), status: 'out_of_stock', image: 'https://picsum.photos/seed/apple/400/300', store_id: 's7', store_name: 'Lotte Mart', discount: 54, created_at: day(-2), rating: 4.5, review_count: 28, co2_saved: 0.8, rescued_score: 0, ingredients: JSON.stringify(['Táo đỏ']), allergens: JSON.stringify([]), nutrition: JSON.stringify({ calories: 320, protein: 2, carbs: 80, fat: 0, fiber: 10 }), distance: 3.8 },
  { id: 'p28', name: 'Cơm chiên hải sản', category: 'Meals', stock: 4, original_price: 58000, ai_price: 23000, expiry: day(1), status: 'live', image: 'https://picsum.photos/seed/friedrice/400/300', store_id: 's2', store_name: 'GS25', discount: 60, created_at: day(0), rating: 4.3, review_count: 46, co2_saved: 0.6, rescued_score: 83, ingredients: JSON.stringify(['Cơm', 'Tôm', 'Mực', 'Rau củ']), allergens: JSON.stringify(['Shellfish']), nutrition: JSON.stringify({ calories: 540, protein: 28, carbs: 65, fat: 16, fiber: 1 }), distance: 1.2 },
];

const ORDERS = [
  { id: 'o1', user_id: 'u1', store_name: 'GS25', store_id: 's2', subtotal: 65000, delivery_fee: 10000, service_fee: 3000, discount: 5000, total: 73000, status: 'delivered', delivery_method: 'delivery', payment_method: 'momo', created_at: day(-3), estimated_delivery: day(-3), delivered_at: day(-3), qr_code: null, notes: 'Gọi trước khi giao', address: 'Quận 1, HCM' },
  { id: 'o2', user_id: 'u1', store_name: 'WinMart+', store_id: 's1', subtotal: 45000, delivery_fee: 10000, service_fee: 2000, discount: 5000, total: 52000, status: 'delivered', delivery_method: 'delivery', payment_method: 'wallet', created_at: day(-7), estimated_delivery: day(-7), delivered_at: day(-7), qr_code: null, notes: '', address: 'Quận 1, HCM' },
  { id: 'o3', user_id: 'u1', store_name: 'Circle K', store_id: 's3', subtotal: 32000, delivery_fee: 10000, service_fee: 2000, discount: 0, total: 44000, status: 'in_transit', delivery_method: 'delivery', payment_method: 'momo', created_at: day(-1), estimated_delivery: day(0), delivered_at: null, qr_code: null, notes: '', address: 'Quận 1, HCM' },
  { id: 'o4', user_id: 'u1', store_name: 'Co.opmart', store_id: 's5', subtotal: 55000, delivery_fee: 0, service_fee: 3000, discount: 10000, total: 48000, status: 'preparing', delivery_method: 'pickup', payment_method: 'zalopay', created_at: day(0), estimated_delivery: day(0), delivered_at: null, qr_code: 'QR001', notes: '', address: null },
  { id: 'o5', user_id: 'u4', store_name: 'WinMart+', store_id: 's1', subtotal: 120000, delivery_fee: 10000, service_fee: 5000, discount: 15000, total: 120000, status: 'delivered', delivery_method: 'delivery', payment_method: 'vnpay', created_at: day(-10), estimated_delivery: day(-10), delivered_at: day(-10), qr_code: null, notes: '', address: 'Quận Bình Thạnh, HCM' },
  { id: 'o6', user_id: 'u4', store_name: 'AEON Mall', store_id: 's4', subtotal: 85000, delivery_fee: 15000, service_fee: 4000, discount: 5000, total: 99000, status: 'delivered', delivery_method: 'delivery', payment_method: 'momo', created_at: day(-5), estimated_delivery: day(-5), delivered_at: day(-5), qr_code: null, notes: '', address: 'Quận Bình Thạnh, HCM' },
  { id: 'o7', user_id: 'u4', store_name: 'FamilyMart', store_id: 's6', subtotal: 35000, delivery_fee: 0, service_fee: 2000, discount: 0, total: 37000, status: 'cancelled', delivery_method: 'pickup', payment_method: 'wallet', created_at: day(-2), estimated_delivery: day(-2), delivered_at: null, qr_code: null, notes: 'Đổi ý không mua nữa', address: null },
  { id: 'o8', user_id: 'u5', store_name: 'GS25', store_id: 's2', subtotal: 72000, delivery_fee: 10000, service_fee: 4000, discount: 10000, total: 76000, status: 'delivered', delivery_method: 'delivery', payment_method: 'applepay', created_at: day(-4), estimated_delivery: day(-4), delivered_at: day(-4), qr_code: null, notes: '', address: 'Quận 7, HCM' },
  { id: 'o9', user_id: 'u5', store_name: 'Lotte Mart', store_id: 's7', subtotal: 22000, delivery_fee: 0, service_fee: 2000, discount: 0, total: 24000, status: 'ready', delivery_method: 'pickup', payment_method: 'momo', created_at: day(0), estimated_delivery: day(0), delivered_at: null, qr_code: 'QR002', notes: '', address: null },
  { id: 'o10', user_id: 'u7', store_name: 'Circle K', store_id: 's3', subtotal: 32000, delivery_fee: 10000, service_fee: 2000, discount: 0, total: 44000, status: 'pending', delivery_method: 'delivery', payment_method: 'wallet', created_at: day(0), estimated_delivery: day(1), delivered_at: null, qr_code: null, notes: '', address: 'Quận 5, HCM' },
  { id: 'o11', user_id: 'u1', store_name: 'MM Mega Market', store_id: 's8', subtotal: 28000, delivery_fee: 15000, service_fee: 3000, discount: 0, total: 46000, status: 'confirmed', delivery_method: 'delivery', payment_method: 'momo', created_at: day(0), estimated_delivery: day(1), delivered_at: null, qr_code: null, notes: 'Giao giờ hành chính', address: 'Quận 1, HCM' },
  { id: 'o12', user_id: 'u4', store_name: 'Co.opmart', store_id: 's5', subtotal: 67000, delivery_fee: 10000, service_fee: 3000, discount: 5000, total: 75000, status: 'pending', delivery_method: 'delivery', payment_method: 'zalopay', created_at: day(0), estimated_delivery: day(1), delivered_at: null, qr_code: null, notes: '', address: 'Quận Bình Thạnh, HCM' },
];

const ORDER_ITEMS = [
  { order_id: 'o1', product_id: 'p3', product_name: 'Cơm gà sốt teriyaki', product_image: 'https://picsum.photos/seed/chicken/400/300', quantity: 1, unit_price: 25000 },
  { order_id: 'o1', product_id: 'p4', product_name: 'Mì cay Hàn Quốc', product_image: 'https://picsum.photos/seed/ramen/400/300', quantity: 2, unit_price: 9000 },
  { order_id: 'o2', product_id: 'p1', product_name: 'Bánh mì baguette', product_image: 'https://picsum.photos/seed/bread1/400/300', quantity: 2, unit_price: 12000 },
  { order_id: 'o2', product_id: 'p16', product_name: 'Bánh bông lan cuộn', product_image: 'https://picsum.photos/seed/cake/400/300', quantity: 1, unit_price: 14000 },
  { order_id: 'o3', product_id: 'p5', product_name: 'Sữa tươi trân châu', product_image: 'https://picsum.photos/seed/milktea/400/300', quantity: 1, unit_price: 11000 },
  { order_id: 'o3', product_id: 'p26', product_name: 'Bia Hà Nội (lon 330ml)', product_image: 'https://picsum.photos/seed/beer/400/300', quantity: 2, unit_price: 6000 },
  { order_id: 'o4', product_id: 'p9', product_name: 'Cơm tấm sườn bì', product_image: 'https://picsum.photos/seed/comtam/400/300', quantity: 1, unit_price: 22000 },
  { order_id: 'o5', product_id: 'p13', product_name: 'Pizza pepperoni', product_image: 'https://picsum.photos/seed/pizza/400/300', quantity: 1, unit_price: 45000 },
  { order_id: 'o5', product_id: 'p19', product_name: 'Sữa hạt hạnh nhân', product_image: 'https://picsum.photos/seed/almondmilk/400/300', quantity: 2, unit_price: 16000 },
  { order_id: 'o5', product_id: 'p25', product_name: 'Thịt ba chỉ heo (500g)', product_image: 'https://picsum.photos/seed/pork/400/300', quantity: 1, unit_price: 30000 },
  { order_id: 'o6', product_id: 'p8', product_name: 'Trái cây mix (tray)', product_image: 'https://picsum.photos/seed/fruits/400/300', quantity: 1, unit_price: 35000 },
  { order_id: 'o7', product_id: 'p11', product_name: 'Kem vanila (hộp)', product_image: 'https://picsum.photos/seed/icecream/400/300', quantity: 1, unit_price: 18000 },
  { order_id: 'o8', product_id: 'p28', product_name: 'Cơm chiên hải sản', product_image: 'https://picsum.photos/seed/friedrice/400/300', quantity: 1, unit_price: 23000 },
  { order_id: 'o8', product_id: 'p26', product_name: 'Bia Hà Nội (lon 330ml)', product_image: 'https://picsum.photos/seed/beer/400/300', quantity: 3, unit_price: 6000 },
  { order_id: 'o9', product_id: 'p21', product_name: 'Bánh mì sandwich', product_image: 'https://picsum.photos/seed/sandwich/400/300', quantity: 1, unit_price: 7000 },
  { order_id: 'o10', product_id: 'p5', product_name: 'Sữa tươi trân châu', product_image: 'https://picsum.photos/seed/milktea/400/300', quantity: 2, unit_price: 11000 },
  { order_id: 'o11', product_id: 'p15', product_name: 'Snack khoai tây (gói lớn)', product_image: 'https://picsum.photos/seed/chips/400/300', quantity: 1, unit_price: 9000 },
  { order_id: 'o12', product_id: 'p10', product_name: 'Nước cam ép', product_image: 'https://picsum.photos/seed/orangejuice/400/300', quantity: 1, unit_price: 12000 },
  { order_id: 'o12', product_id: 'p19', product_name: 'Sữa hạt hạnh nhân', product_image: 'https://picsum.photos/seed/almondmilk/400/300', quantity: 1, unit_price: 16000 },
];

const TRACKING = [
  { order_id: 'o1', status: 'pending', time: day(-3), completed: true },
  { order_id: 'o1', status: 'confirmed', time: day(-3), completed: true },
  { order_id: 'o1', status: 'preparing', time: day(-3), completed: true },
  { order_id: 'o1', status: 'in_transit', time: day(-3), completed: true },
  { order_id: 'o1', status: 'delivered', time: day(-3), completed: true },
  { order_id: 'o3', status: 'pending', time: day(-1), completed: true },
  { order_id: 'o3', status: 'confirmed', time: day(-1), completed: true },
  { order_id: 'o3', status: 'preparing', time: day(-1), completed: true },
  { order_id: 'o3', status: 'in_transit', time: day(0), completed: false },
  { order_id: 'o4', status: 'pending', time: day(0), completed: true },
  { order_id: 'o4', status: 'confirmed', time: day(0), completed: true },
  { order_id: 'o4', status: 'preparing', time: day(0), completed: false },
];

const PARTNERS = [
  { id: 'pr1', name: 'WinMart+', owner: 'Lan Nguyễn', location: 'Quận 1, HCM', phone: '0907654321', email: 'lan@winmart.vn', status: 'approved', created_at: day(-365), approved_at: day(-360) },
  { id: 'pr2', name: 'GS25', owner: 'Anh Đặng', location: 'Quận 1, HCM', phone: '0956789012', email: 'anh@gs25.vn', status: 'approved', created_at: day(-300), approved_at: day(-295) },
  { id: 'pr3', name: 'Circle K Vietnam', owner: 'Tuấn Phạm', location: 'Quận 3, HCM', phone: '0971234567', email: 'tuan@circle.vn', status: 'approved', created_at: day(-200), approved_at: day(-195) },
  { id: 'pr4', name: 'FamilyMart', owner: 'Hương Lê', location: 'Quận 5, HCM', phone: '0987654321', email: 'huong@familymart.vn', status: 'pending', created_at: day(-5), approved_at: null },
  { id: 'pr5', name: 'MM Mega Market', owner: 'Quân Nguyễn', location: 'Bình Thạnh, HCM', phone: '0998765432', email: 'quan@mm.vn', status: 'approved', created_at: day(-180), approved_at: day(-175) },
  { id: 'pr6', name: 'Bách Hóa Xanh', owner: 'Trung Lê', location: 'Quận 2, HCM', phone: '0911223344', email: 'trung@bhx.vn', status: 'rejected', created_at: day(-30), approved_at: null },
];

const TRANSACTIONS = [
  { id: 'tx1', user_id: 'u1', type: 'payment', amount: -73000, date: day(-3), status: 'completed', description: 'Mua hàng tại GS25', payment_method: 'momo', reference: 'ORD-o1' },
  { id: 'tx2', user_id: 'u1', type: 'payment', amount: -52000, date: day(-7), status: 'completed', description: 'Mua hàng tại WinMart+', payment_method: 'wallet', reference: 'ORD-o2' },
  { id: 'tx3', user_id: 'u1', type: 'topup', amount: 200000, date: day(-5), status: 'completed', description: 'Nạp ví', payment_method: 'momo', reference: null },
  { id: 'tx4', user_id: 'u2', type: 'revenue', amount: 4500000, date: day(-3), status: 'completed', description: 'Doanh thu tháng 5', payment_method: null, reference: null },
  { id: 'tx5', user_id: 'u2', type: 'withdrawal', amount: -2000000, date: day(-2), status: 'completed', description: 'Rút tiền về ngân hàng', payment_method: null, reference: 'WD001' },
  { id: 'tx6', user_id: 'u4', type: 'payment', amount: -120000, date: day(-10), status: 'completed', description: 'Mua hàng tại WinMart+', payment_method: 'vnpay', reference: 'ORD-o5' },
  { id: 'tx7', user_id: 'u4', type: 'payment', amount: -99000, date: day(-5), status: 'completed', description: 'Mua hàng tại AEON Mall', payment_method: 'momo', reference: 'ORD-o6' },
  { id: 'tx8', user_id: 'u4', type: 'refund', amount: 37000, date: day(-2), status: 'completed', description: 'Hoàn tiền đơn hủy FamilyMart', payment_method: 'wallet', reference: 'ORD-o7' },
  { id: 'tx9', user_id: 'u5', type: 'payment', amount: -76000, date: day(-4), status: 'completed', description: 'Mua hàng tại GS25', payment_method: 'applepay', reference: 'ORD-o8' },
  { id: 'tx10', user_id: 'u2', type: 'revenue', amount: 1200000, date: day(0), status: 'pending', description: 'Doanh thu hôm nay', payment_method: null, reference: null },
  { id: 'tx11', user_id: 'u6', type: 'revenue', amount: 3800000, date: day(-2), status: 'completed', description: 'Doanh thu tháng 5', payment_method: null, reference: null },
  { id: 'tx12', user_id: 'u6', type: 'commission', amount: -380000, date: day(-2), status: 'completed', description: 'Phí hoa hồng 10%', payment_method: null, reference: null },
];

const FRAUD_ALERTS = [
  { id: 'fa1', type: 'price_manipulation', store: 'Lotte Mart', risk: 'High', score: 87, time: day(-1), description: 'Phát hiện thay đổi giá bất thường trong 5 phút', status: 'open' },
  { id: 'fa2', type: 'fake_product', store: 'Cửa hàng XYZ', risk: 'Critical', score: 95, time: day(-2), description: 'Sản phẩm nghi ngờ hàng giả, trùng khớp 92% với cơ sở dữ liệu hàng cấm', status: 'investigating' },
  { id: 'fa3', type: 'bulk_purchase', store: 'MM Mega Market', risk: 'Medium', score: 62, time: day(-3), description: 'Mua số lượng lớn thực phẩm giảm giá (45 đơn/giờ)', status: 'open' },
  { id: 'fa4', type: 'login_anomaly', store: 'Circle K', risk: 'Low', score: 35, time: day(0), description: 'Đăng nhập từ IP lạ tại Hà Nội', status: 'resolved' },
  { id: 'fa5', type: 'refund_abuse', store: 'GS25', risk: 'High', score: 82, time: day(-5), description: 'Yêu cầu hoàn tiền 5 lần trong 24h', status: 'investigating' },
  { id: 'fa6', type: 'fake_product', store: 'Bách Hóa Xanh', risk: 'Medium', score: 68, time: day(-7), description: 'Hình ảnh sản phẩm không khớp với mô tả', status: 'open' },
];

const TICKETS = [
  { id: 't1', customer: 'Thảo Lê', issue: 'Đơn hàng giao thiếu sản phẩm - đơn o5', priority: 'High', status: 'open', created_at: day(-2), category: 'delivery' },
  { id: 't2', customer: 'Duy Hoàng', issue: 'Thanh toán momo bị lỗi - đã trừ tiền nhưng không có đơn', priority: 'Urgent', status: 'open', created_at: day(-1), category: 'payment' },
  { id: 't3', customer: 'Mai Vũ', issue: 'Sản phẩm hết hạn trước ngày ghi trên bao bì', priority: 'Medium', status: 'escalated', created_at: day(-5), category: 'product' },
  { id: 't4', customer: 'Minh Trần', issue: 'Hỗ trợ đăng ký tài khoản partner', priority: 'Low', status: 'resolved', created_at: day(-10), category: 'account' },
  { id: 't5', customer: 'Anh Đặng', issue: 'API không đồng bộ dữ liệu kho', priority: 'High', status: 'open', created_at: day(0), category: 'technical' },
];

const NOTIFICATIONS = [
  { id: 'n1', type: 'deal', title: 'Deal sốc!', message: 'Bánh mì baguette giảm 66% chỉ còn 12,000đ', time: day(0), read: false, icon: 'Sparkles', action_url: '/customer' },
  { id: 'n2', type: 'order', title: 'Đơn hàng đang giao', message: 'Đơn o3 từ Circle K đang trên đường đến bạn', time: day(0), read: false, icon: 'Truck', action_url: '/customer/orders' },
  { id: 'n3', type: 'voucher', title: 'Voucher mới!', message: 'Giảm 20% cho đơn hàng trên 100,000đ', time: day(-1), read: false, icon: 'Ticket', action_url: '/customer' },
  { id: 'n4', type: 'system', title: 'Bảo trì hệ thống', message: 'Bảo trì định kỳ 02:00-04:00 ngày mai', time: day(-1), read: true, icon: 'Settings', action_url: null },
  { id: 'n5', type: 'community', title: 'Thành tích mới!', message: 'Bạn đã đạt mốc 50kg thực phẩm được cứu', time: day(-2), read: true, icon: 'Award', action_url: '/customer' },
  { id: 'n6', type: 'ai', title: 'AI đề xuất', message: 'Cơm chiên hải sản tại GS25 sắp hết - chỉ còn 4 suất!', time: day(0), read: false, icon: 'Bot', action_url: '/customer/deals' },
  { id: 'n7', type: 'order', title: 'Đơn hàng mới', message: 'Đơn o12 từ Co.opmart đã được xác nhận', time: day(0), read: false, icon: 'ShoppingBag', action_url: '/customer/orders' },
  { id: 'n8', type: 'community', title: 'Bảng xếp hạng ESG', message: 'Bạn đang ở top 5% người dùng tích cực nhất', time: day(-3), read: true, icon: 'Leaf', action_url: '/customer' },
];

async function insert(table, rows) {
  if (!rows.length) return;
  // Insert in batches of 20
  for (let i = 0; i < rows.length; i += 20) {
    const batch = rows.slice(i, i + 20);
    const { error } = await supabase.from(table).upsert(batch, { onConflict: 'id', ignoreDuplicates: false });
    if (error) console.error(`  ${table} error:`, error.message.slice(0, 80));
    else console.log(`  ${table}: inserted ${batch.length} rows`);
  }
}

async function seed() {
  console.log('Seeding data...');
  await insert('users', USERS);
  await insert('stores', STORES);
  await insert('products', PRODUCTS);
  await insert('partners', PARTNERS);
  await insert('orders', ORDERS);
  await insert('order_items', ORDER_ITEMS);
  await insert('tracking_steps', TRACKING);
  await insert('transactions', TRANSACTIONS);
  await insert('fraud_alerts', FRAUD_ALERTS);
  await insert('support_tickets', TICKETS);
  await insert('notifications', NOTIFICATIONS);
  console.log('Done!');
}

seed().catch(console.error);
