import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rescueData = JSON.parse(readFileSync(join(__dirname, '../lib/data/rescue-products-db.json'), 'utf-8'));

function loadSupabaseConfig() {
  const configPath = join(__dirname, '../config/supabase.json');
  if (existsSync(configPath)) {
    const file = JSON.parse(readFileSync(configPath, 'utf-8'));
    return {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || file.supabaseUrl,
      key: process.env.SUPABASE_SERVICE_ROLE_KEY || file.serviceRoleKey,
    };
  }
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    key: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
}

const { url: URL, key: KEY } = loadSupabaseConfig();
if (!URL || !KEY) {
  console.error('Missing Supabase config. Set config/supabase.json or env NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

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
  ...rescueData.stores,
  { id: 's2', name: 'GS25', address: '65 Lê Lợi, Quận 1', phone: '02838225566', rating: 4.2, review_count: 890, is_open: true, open_hours: '00:00-24:00', distance: 1.2, deals_count: 8, image: 'https://picsum.photos/seed/gs25/400/300', since: '2023-01-15' },
  { id: 's3', name: 'Circle K', address: '180 Nguyễn Đình Chiểu, Quận 3', phone: '02839334455', rating: 4.0, review_count: 670, is_open: true, open_hours: '00:00-24:00', distance: 1.5, deals_count: 6, image: 'https://picsum.photos/seed/circle/400/300', since: '2022-09-01' },
  { id: 's6', name: 'FamilyMart', address: '39 Nguyễn Trãi, Quận 5', phone: '02838334455', rating: 4.1, review_count: 780, is_open: true, open_hours: '00:00-24:00', distance: 2.5, deals_count: 9, image: 'https://picsum.photos/seed/family/400/300', since: '2023-04-01' },
];

const PRODUCTS = rescueData.products;

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

function sslHint(err) {
  const code = err?.cause?.code || err?.code;
  if (code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' || String(err?.message).includes('fetch failed')) {
    return ' (SSL: chạy lại với `npm run seed:rescue` hoặc `node --use-system-ca scripts/seed.mjs`)';
  }
  return '';
}

async function insert(table, rows) {
  if (!rows.length) return;
  for (let i = 0; i < rows.length; i += 20) {
    const batch = rows.slice(i, i + 20);
    const { error } = await supabase.from(table).upsert(batch, { onConflict: 'id', ignoreDuplicates: false });
    if (error) {
      const msg = error.message || String(error);
      console.error(`  ${table} error:`, msg.slice(0, 120) + sslHint(error));
    } else {
      console.log(`  ${table}: inserted ${batch.length} rows`);
    }
  }
}

async function seed() {
  console.log('Seeding data...');
  const USERS_HASHED = await Promise.all(USERS.map(async u => ({
    ...u,
    password: await bcrypt.hash(u.password, 12),
  })));
  await insert('users', USERS_HASHED);
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
