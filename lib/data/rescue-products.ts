import type { Product, ProductCategory } from './products';

export type FreshnessStatus = 'expired' | 'fresh' | 'expiring_soon';

export interface RescueProductSeed {
  id: string;
  name: string;
  category: ProductCategory;
  discount: number;
  freshness: FreshnessStatus;
  description: string;
  details: string;
  storeId: string;
  storeName: string;
  distance: number;
  co2Saved: number;
  mfgDate: string;
  expiryDate: string;
  nutrition: { calories: number; protein: number; carbs: number; fat: number; fiber: number };
  ingredients: string[];
  originalPrice: number;
  aiPrice: number;
  stock?: number;
  /** Curated food photo URL (Unsplash) */
  image: string;
}

/** Stable Unsplash food photos — not random placeholders */
const img = (photoId: string) =>
  `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=400&h=400&q=80`;

/** Partner stores referenced by the 30 rescue products */
export const RESCUE_STORES = [
  { id: 's1', name: 'WinMart+', address: 'Số 1 Nguyễn Huệ, Quận 1', phone: '02838223344', rating: 4.5, review_count: 1250, is_open: true, open_hours: '06:00-23:00', distance: 2.1, deals_count: 12, image: 'https://picsum.photos/seed/winmart/400/300', since: '2022-06-01' },
  { id: 's4', name: 'AEON Citimart', address: 'Tân Phú, HCM', phone: '02837626688', rating: 4.7, review_count: 2100, is_open: true, open_hours: '09:00-22:00', distance: 7.2, deals_count: 25, image: 'https://picsum.photos/seed/aeon/400/300', since: '2021-11-01' },
  { id: 's5', name: 'CoopMart', address: '190 Cống Quỳnh, Quận 1', phone: '02839223344', rating: 4.3, review_count: 1560, is_open: true, open_hours: '07:00-22:00', distance: 4.3, deals_count: 15, image: 'https://picsum.photos/seed/coop/400/300', since: '2022-03-01' },
  { id: 's7', name: 'Lotte Mart', address: 'Nam Kỳ Khởi Nghĩa, Quận 3', phone: '02839332211', rating: 4.4, review_count: 1340, is_open: true, open_hours: '08:00-22:00', distance: 5.0, deals_count: 18, image: 'https://picsum.photos/seed/lotte/400/300', since: '2022-08-01' },
  { id: 's8', name: 'MM Mega Market', address: 'Quốc Lộ 13, Bình Thạnh', phone: '02835556677', rating: 4.0, review_count: 560, is_open: true, open_hours: '06:00-21:00', distance: 6.5, deals_count: 10, image: 'https://picsum.photos/seed/mm/400/300', since: '2023-06-01' },
  { id: 's9', name: 'Bách Hóa Xanh', address: 'Quận 2, HCM', phone: '02837445566', rating: 4.2, review_count: 3200, is_open: true, open_hours: '07:00-22:00', distance: 1.2, deals_count: 22, image: 'https://picsum.photos/seed/bhx/400/300', since: '2019-01-01' },
  { id: 's10', name: 'Tops Market', address: 'Quận 10, HCM', phone: '02838667788', rating: 4.3, review_count: 890, is_open: true, open_hours: '08:00-22:00', distance: 3.7, deals_count: 14, image: 'https://picsum.photos/seed/tops/400/300', since: '2020-05-01' },
  { id: 's11', name: 'Kingfood Mart', address: 'Quận Phú Nhuận, HCM', phone: '02839998877', rating: 4.1, review_count: 420, is_open: true, open_hours: '07:00-21:30', distance: 3.1, deals_count: 9, image: 'https://picsum.photos/seed/kingfood/400/300', since: '2021-03-01' },
  { id: 's12', name: 'Farmers Market', address: 'Quận 1, HCM', phone: '02838112233', rating: 4.6, review_count: 210, is_open: true, open_hours: '06:00-20:00', distance: 1.8, deals_count: 7, image: 'https://picsum.photos/seed/farmers/400/300', since: '2023-09-01' },
];

export const RESCUE_PRODUCT_SEEDS: RescueProductSeed[] = [
  // Vegetables
  { id: 'rp01', name: 'Rau cải bó xôi', category: 'Vegetables', discount: 64, freshness: 'expired', description: 'Sản phẩm giải cứu thơm ngon, được bảo quản chất lượng chuẩn an toàn thực phẩm.', details: 'Bao bì nguyên vẹn. Bảo quản tủ mát/nhiệt độ phòng tùy loại sản phẩm. Thích hợp sử dụng ngay để giải quyết vấn đề lãng phí thức ăn.', storeId: 's8', storeName: 'MM Mega Market', distance: 6.5, co2Saved: 0.3, mfgDate: '2026-05-26 06:00', expiryDate: '2026-05-27 12:00', nutrition: { calories: 23, protein: 3, carbs: 4, fat: 0, fiber: 2 }, ingredients: ['Cải bó xôi'], originalPrice: 25000, aiPrice: 9000, stock: 4, image: img('1576045057995-568f588f82fb') },
  { id: 'rp02', name: 'Bông cải xanh Đà Lạt', category: 'Vegetables', discount: 50, freshness: 'fresh', description: 'Bông cải xanh tươi, giàu vitamin, được thu hoạch và vận chuyển trong ngày.', details: 'Cuống còn xanh, bông dày không dập nát. Bảo quản lạnh từ 4-8°C.', storeId: 's1', storeName: 'WinMart+', distance: 2.1, co2Saved: 0.4, mfgDate: '2026-05-25 07:00', expiryDate: '2026-05-28 18:00', nutrition: { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6 }, ingredients: ['Bông cải xanh tự nhiên'], originalPrice: 45000, aiPrice: 22500, stock: 7, image: img('1615485290382-441e4d049cb5') },
  { id: 'rp03', name: 'Cà rốt hữu cơ', category: 'Vegetables', discount: 55, freshness: 'expiring_soon', description: 'Cà rốt ngọt tự nhiên, nhiều nước, thích hợp làm nước ép hoặc nấu canh.', details: 'Đã rửa sạch, đóng túi nilon đục lỗ thoáng khí. Bảo quản mát.', storeId: 's5', storeName: 'CoopMart', distance: 4.3, co2Saved: 0.25, mfgDate: '2026-05-24 08:00', expiryDate: '2026-05-27 20:00', nutrition: { calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8 }, ingredients: ['Cà rốt tươi 100%'], originalPrice: 30000, aiPrice: 13500, stock: 6, image: img('1598170845058-32b996a6bd11') },
  { id: 'rp04', name: 'Xà lách thủy canh Mỹ', category: 'Vegetables', discount: 60, freshness: 'fresh', description: 'Xà lách giòn ngọt, chuyên dùng cho các món salad Hy Lạp hoặc ăn kèm đồ nướng.', details: 'Còn nguyên gốc rễ thủy canh để giữ độ tươi. Đóng cây trong túi nhựa chuyên dụng.', storeId: 's7', storeName: 'Lotte Mart', distance: 5.0, co2Saved: 0.15, mfgDate: '2026-05-26 05:30', expiryDate: '2026-05-29 05:30', nutrition: { calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, fiber: 1.3 }, ingredients: ['Xà lách mỡ thủy canh'], originalPrice: 35000, aiPrice: 14000, stock: 5, image: img('1621252179057-279c74b227c5') },
  { id: 'rp05', name: 'Cà chua Beef Đà Lạt', category: 'Vegetables', discount: 48, freshness: 'fresh', description: 'Cà chua quả to, mọng nước, thịt dày và ít hạt, vị chua ngọt hài hòa.', details: 'Quả chín đỏ đều, không nứt nẻ. Thích hợp ăn sống hoặc làm sốt.', storeId: 's9', storeName: 'Bách Hóa Xanh', distance: 1.2, co2Saved: 0.35, mfgDate: '2026-05-25 09:00', expiryDate: '2026-05-29 09:00', nutrition: { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2 }, ingredients: ['Cà chua Beef'], originalPrice: 28000, aiPrice: 14500, stock: 8, image: img('1595855759920-86582396756a') },
  { id: 'rp06', name: 'Nấm đùi gà baby', category: 'Vegetables', discount: 62, freshness: 'expiring_soon', description: 'Nấm đùi gà nhỏ, thịt nấm dai giòn, ngọt thanh, thích hợp cho các món xào, lẩu.', details: 'Đóng khay bọc màng co kín. Cần chế biến ngay sau khi mua.', storeId: 's10', storeName: 'Tops Market', distance: 3.7, co2Saved: 0.2, mfgDate: '2026-05-24 10:00', expiryDate: '2026-05-27 18:00', nutrition: { calories: 35, protein: 3.1, carbs: 5.5, fat: 0.5, fiber: 2.1 }, ingredients: ['Nấm đùi gà tươi'], originalPrice: 42000, aiPrice: 16000, stock: 5, image: img('1534422298391-e4f8c172dddb') },

  // Fruits
  { id: 'rp07', name: 'Chuối già Nam Mỹ', category: 'Fruits', discount: 50, freshness: 'fresh', description: 'Chuối chín tự nhiên, vỏ vàng đều, hương thơm đậm đà, giàu kali.', details: 'Nải từ 5-7 quả, vỏ có thể xuất hiện đốm mật (đạt độ ngọt cao nhất).', storeId: 's8', storeName: 'MM Mega Market', distance: 6.5, co2Saved: 0.5, mfgDate: '2026-05-24 06:00', expiryDate: '2026-05-28 12:00', nutrition: { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6 }, ingredients: ['Chuối chín nguyên quả'], originalPrice: 32000, aiPrice: 16000, stock: 9, image: img('1571771894031-90985770cce6') },
  { id: 'rp08', name: 'Táo Fuji Nam Phi', category: 'Fruits', discount: 40, freshness: 'fresh', description: 'Táo nhập khẩu giòn ngọt, nhiều nước, vỏ ngoài màu đỏ hồng đẹp mắt.', details: 'Đóng túi lưới 4 quả. Bảo quản lạnh để giữ độ giòn tốt nhất.', storeId: 's4', storeName: 'AEON Citimart', distance: 7.2, co2Saved: 0.6, mfgDate: '2026-05-22 14:00', expiryDate: '2026-05-30 14:00', nutrition: { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4 }, ingredients: ['Táo Fuji tươi'], originalPrice: 69000, aiPrice: 41400, stock: 6, image: img('1560806887-1e4cd0b6cbd6') },
  { id: 'rp09', name: 'Cam sành Hàm Yên', category: 'Fruits', discount: 58, freshness: 'expiring_soon', description: 'Cam sành mọng nước, vị chua ngọt đậm đà, lý tưởng để vắt nước giải nhiệt.', details: 'Vỏ ráo, không bị dập úng. Nên sử dụng trong vòng 1-2 ngày.', storeId: 's1', storeName: 'WinMart+', distance: 2.1, co2Saved: 0.45, mfgDate: '2026-05-23 08:00', expiryDate: '2026-05-27 18:00', nutrition: { calories: 47, protein: 0.9, carbs: 12, fat: 0.1, fiber: 2.4 }, ingredients: ['Cam sành quả tươi'], originalPrice: 26000, aiPrice: 11000, stock: 10, image: img('1611080626913-a8d295325814') },
  { id: 'rp10', name: 'Dưa hấu không hạt Mặt Trời Hồng', category: 'Fruits', discount: 45, freshness: 'fresh', description: 'Dưa hấu đỏ thắm, đặc ruột, không hạt, ngọt lịm và rất thanh mát.', details: 'Quả nguyên vẹn từ 2.5-3kg. Bảo quản nhiệt độ phòng hoặc tủ mát sau khi cắt.', storeId: 's5', storeName: 'CoopMart', distance: 4.3, co2Saved: 0.8, mfgDate: '2026-05-24 11:00', expiryDate: '2026-05-29 11:00', nutrition: { calories: 30, protein: 0.6, carbs: 8, fat: 0.2, fiber: 0.4 }, ingredients: ['Dưa hấu không hạt'], originalPrice: 55000, aiPrice: 30250, stock: 3, image: img('1587049352339-40cf3d22e17c') },
  { id: 'rp11', name: 'Xoài cát Chu chín cây', category: 'Fruits', discount: 65, freshness: 'expired', description: 'Xoài cát Chu chín vàng ruộm, thịt xoài mềm mịn, ngọt lịm không xơ.', details: 'Đóng khay 2 quả. Xoài đã chín kỹ, cần ăn ngay hoặc làm sinh tố, kem.', storeId: 's11', storeName: 'Kingfood Mart', distance: 3.1, co2Saved: 0.4, mfgDate: '2026-05-23 07:00', expiryDate: '2026-05-26 22:00', nutrition: { calories: 60, protein: 0.8, carbs: 15, fat: 0.3, fiber: 1.6 }, ingredients: ['Xoài cát Chu chín'], originalPrice: 48000, aiPrice: 16800, stock: 2, image: img('1553279766-10fe561e1ed0') },
  { id: 'rp12', name: 'Dâu tây giống New Zealand (Đà Lạt)', category: 'Fruits', discount: 52, freshness: 'expiring_soon', description: 'Dâu tây trái vừa, đỏ đều, vị chua thanh ngọt hậu đặc trưng, hương thơm ngào ngạt.', details: 'Hộp nhựa 250g có lỗ thoáng khí. Gặp vài quả có vết cấn nhẹ do vận chuyển.', storeId: 's12', storeName: 'Farmers Market', distance: 1.8, co2Saved: 0.22, mfgDate: '2026-05-25 05:00', expiryDate: '2026-05-27 15:00', nutrition: { calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, fiber: 2 }, ingredients: ['Dâu tây tươi Đà Lạt'], originalPrice: 85000, aiPrice: 40800, stock: 4, image: img('1464965509437-d400171216d5') },

  // Meat & seafood -> Produce
  { id: 'rp13', name: 'Ức gà phi lê không da', category: 'Produce', discount: 45, freshness: 'fresh', description: 'Ức gà nạc 100%, thực phẩm vàng cho chế độ ăn kiêng, tăng cơ giảm mỡ.', details: 'Khay 500g hút chân không bảo quản mát ở 0-2°C. Chế biến trong ngày hoặc cấp đông.', storeId: 's7', storeName: 'Lotte Mart', distance: 5.0, co2Saved: 1.2, mfgDate: '2026-05-26 04:00', expiryDate: '2026-05-28 04:00', nutrition: { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 }, ingredients: ['Ức gà tươi sạch'], originalPrice: 50000, aiPrice: 27500, stock: 6, image: img('1604503467796-cf90098f2acb') },
  { id: 'rp14', name: 'Thịt ba rọi heo CP', category: 'Produce', discount: 35, freshness: 'fresh', description: 'Thịt ba chỉ heo có tỷ lệ nạc mỡ cân bằng, phần da mỏng giòn, thích hợp kho hoặc luộc.', details: 'Khay 400g có màng bọc. Đảm bảo tiêu chuẩn thịt sạch an toàn.', storeId: 's9', storeName: 'Bách Hóa Xanh', distance: 1.2, co2Saved: 1.8, mfgDate: '2026-05-26 03:00', expiryDate: '2026-05-28 03:00', nutrition: { calories: 260, protein: 16.5, carbs: 0, fat: 21.5, fiber: 0 }, ingredients: ['Thịt heo ba rọi tươi'], originalPrice: 78000, aiPrice: 50700, stock: 5, image: img('1602474463155-331bd281e801') },
  { id: 'rp15', name: 'Ba chỉ bò Mỹ cắt lát (Lẩu/Nướng)', category: 'Produce', discount: 40, freshness: 'fresh', description: 'Thịt bò nhập khẩu, cắt lát mỏng đều, vân mỡ đều đặn giúp thịt mềm ngậy không bị khô.', details: 'Khay đông lạnh 500g. Vừa rã đông nhẹ, cần dùng ngay để nhúng lẩu hoặc nướng.', storeId: 's8', storeName: 'MM Mega Market', distance: 6.5, co2Saved: 2.5, mfgDate: '2026-05-20 08:00', expiryDate: '2026-05-28 08:00', nutrition: { calories: 290, protein: 14, carbs: 0, fat: 26, fiber: 0 }, ingredients: ['100% Thịt ba chỉ bò Mỹ'], originalPrice: 135000, aiPrice: 81000, stock: 4, image: img('1544025162-d76694265947') },
  { id: 'rp16', name: 'Cá hồi Na-uy phi lê (Còn da)', category: 'Produce', discount: 50, freshness: 'expiring_soon', description: 'Phi lê cá hồi giàu Omega-3, thịt cá màu cam tươi, béo ngậy tự nhiên.', details: 'Khay 200g bọc kín. Thích hợp cho món áp chảo, kho tiêu (không khuyên dùng ăn sashimi sống vì sắp hết hạn mát).', storeId: 's10', storeName: 'Tops Market', distance: 3.7, co2Saved: 1.5, mfgDate: '2026-05-25 06:00', expiryDate: '2026-05-27 18:00', nutrition: { calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0 }, ingredients: ['Cá hồi phi lê tươi'], originalPrice: 120000, aiPrice: 60000, stock: 3, image: img('1467003909585-2f8a72700288') },
  { id: 'rp17', name: 'Tôm thẻ chân trắng tươi', category: 'Produce', discount: 48, freshness: 'fresh', description: 'Tôm thẻ vỏ mỏng, thịt săn chắc và có vị ngọt tự nhiên rõ rệt khi hấp hoặc rang.', details: 'Hộp 300g (khoảng 15-18 con). Ớp đá giữ nhiệt trong suốt quá trình trưng bày.', storeId: 's5', storeName: 'CoopMart', distance: 4.3, co2Saved: 0.9, mfgDate: '2026-05-26 05:00', expiryDate: '2026-05-28 05:00', nutrition: { calories: 99, protein: 24, carbs: 0.2, fat: 0.3, fiber: 0 }, ingredients: ['Tôm thẻ sinh thái tươi'], originalPrice: 65000, aiPrice: 33800, stock: 5, image: img('1559737551-789a6113b284') },
  { id: 'rp18', name: 'Đùi gà góc tư phi lê', category: 'Produce', discount: 55, freshness: 'expired', description: 'Đùi gà góc tư bản lớn, thịt dai dẻo mọng nước, giữ nguyên phần da gà béo ngậy.', details: 'Khay 500g. Sản phẩm quá hạn lưu kho mát, khuyến cáo nấu chín kỹ (chiên, nướng) hoặc làm thức ăn cho thú cưng.', storeId: 's1', storeName: 'WinMart+', distance: 2.1, co2Saved: 1.1, mfgDate: '2026-05-24 06:00', expiryDate: '2026-05-26 18:00', nutrition: { calories: 184, protein: 17, carbs: 0, fat: 12, fiber: 0 }, ingredients: ['Đùi gà tươi'], originalPrice: 40000, aiPrice: 18000, stock: 3, image: img('1587593810167-a849c6da0b7f') },

  // Dairy & bakery
  { id: 'rp19', name: 'Sữa tươi tiệt trùng TH True Milk (Ít đường)', category: 'Dairy', discount: 60, freshness: 'expiring_soon', description: 'Sữa tươi nguyên chất từ trang trại TH, bổ sung vi chất và giảm lượng đường thích hợp cho cả gia đình.', details: 'Hộp lớn 1 Lít. Vỏ hộp hơi móp nhẹ góc do vận chuyển, cam kết chất lượng sữa bên trong hoàn hảo.', storeId: 's7', storeName: 'Lotte Mart', distance: 5.0, co2Saved: 0.3, mfgDate: '2025-11-27 00:00', expiryDate: '2026-05-28 00:00', nutrition: { calories: 70, protein: 3, carbs: 7.5, fat: 3.2, fiber: 0 }, ingredients: ['Sữa bò tươi (96%)', 'đường tinh luyện', 'vitamin'], originalPrice: 36000, aiPrice: 14400, stock: 8, image: img('1563636612116-1e5e0343c865') },
  { id: 'rp20', name: 'Sữa chua ăn tự nhiên Vinamilk', category: 'Dairy', discount: 50, freshness: 'fresh', description: 'Sữa chua lên men tự nhiên, giúp bổ sung lợi khuẩn, tốt cho hệ tiêu hóa và làm đẹp da.', details: 'Lốc 4 hộp x 100g. Bảo quản lạnh liên tục ở nhiệt độ 4-6°C.', storeId: 's9', storeName: 'Bách Hóa Xanh', distance: 1.2, co2Saved: 0.15, mfgDate: '2026-04-15 08:00', expiryDate: '2026-05-30 08:00', nutrition: { calories: 105, protein: 3.5, carbs: 15, fat: 2.8, fiber: 0 }, ingredients: ['Sữa', 'đường', 'gelatin thực phẩm', 'men chọn lọc'], originalPrice: 28000, aiPrice: 14000, stock: 12, image: img('1488477314532-3f10a59e31bf') },
  { id: 'rp21', name: 'Bánh mì gối Sandwich lạt (Kinh Đô)', category: 'Bakery', discount: 65, freshness: 'expiring_soon', description: 'Bánh mì gối mềm xốp, thơm mùi bơ sữa, hoàn hảo cho bữa sáng nhanh gọn với trứng hoặc mứt.', details: 'Gói 275g (10 lát). Hạn sử dụng ngắn, khuyến khích dùng ngay hoặc trữ đông để kéo dài độ tươi.', storeId: 's5', storeName: 'CoopMart', distance: 4.3, co2Saved: 0.2, mfgDate: '2026-05-23 04:00', expiryDate: '2026-05-28 04:00', nutrition: { calories: 250, protein: 8, carbs: 49, fat: 3, fiber: 2.3 }, ingredients: ['Bột mì', 'nước', 'đường', 'dầu thực vật', 'men bánh mì', 'muối'], originalPrice: 24000, aiPrice: 8400, stock: 7, image: img('1509441254328-3ea222d37aa7') },
  { id: 'rp22', name: 'Bánh sừng bò Croissant bơ Pháp', category: 'Bakery', discount: 55, freshness: 'expired', description: 'Bánh nướng lò siêu thị, lớp vỏ ngàn lớp giòn rụm bên ngoài và ruột mềm ẩm bên trong đượm mùi bơ.', details: 'Đóng túi giấy 3 chiếc. Sản phẩm nướng trong ngày nhưng đã qua khung giờ vàng tươi ngon. Sấy nóng lại trước khi ăn sẽ ngon như mới.', storeId: 's4', storeName: 'AEON Citimart', distance: 7.2, co2Saved: 0.18, mfgDate: '2026-05-26 05:00', expiryDate: '2026-05-27 05:00', nutrition: { calories: 406, protein: 8.2, carbs: 46, fat: 21, fiber: 2.6 }, ingredients: ['Bột mì', 'bơ lạt nhập khẩu', 'men', 'đường', 'trứng gà'], originalPrice: 45000, aiPrice: 20250, stock: 5, image: img('1555507036342-d3ef4c80a753') },
  { id: 'rp23', name: 'Phô mai lát Cheddar Anchor', category: 'Dairy', discount: 40, freshness: 'fresh', description: 'Phô mai lát màu vàng đặc trưng, vị mặn béo đậm đà, dễ nóng chảy khi gặp nhiệt, chuyên kẹp Burger.', details: 'Gói 200g (12 lát). Bao bì nguyên seal dán kín, bảo quản ngăn mát tủ lạnh.', storeId: 's8', storeName: 'MM Mega Market', distance: 6.5, co2Saved: 0.35, mfgDate: '2025-08-10 11:00', expiryDate: '2026-05-31 11:00', nutrition: { calories: 310, protein: 18, carbs: 2, fat: 25, fiber: 0 }, ingredients: ['Phô mai Cheddar tươi', 'sữa', 'muối', 'men tự nhiên'], originalPrice: 68000, aiPrice: 40800, stock: 6, image: img('1618265341355-d909119090bc') },
  { id: 'rp24', name: 'Bánh bông lan cuộn vị Dâu Tây', category: 'Bakery', discount: 50, freshness: 'expiring_soon', description: 'Bánh bông lan cuộn kem mỏng mịn, xen lẫn mứt dâu chua ngọt, cốt bánh mềm mại không nghẹn.', details: 'Hộp nhựa trong 1 cuộn dài. Thích hợp làm món ăn vặt xế chiều cho văn phòng.', storeId: 's1', storeName: 'WinMart+', distance: 2.1, co2Saved: 0.12, mfgDate: '2026-05-22 09:00', expiryDate: '2026-05-27 18:00', nutrition: { calories: 180, protein: 3.5, carbs: 32, fat: 4.5, fiber: 0.5 }, ingredients: ['Trứng', 'bột mì', 'mứt dâu tây', 'kem béo thực vật', 'đường'], originalPrice: 35000, aiPrice: 17500, stock: 4, image: img('1519869325930-281384150729') },

  // Prepared meals
  { id: 'rp25', name: 'Cơm chiên Dương Châu đóng hộp', category: 'Meals', discount: 55, freshness: 'expiring_soon', description: 'Cơm hạt tơi xốp chiên cùng lạp xưởng, tôm khô, đậu Hà Lan và cà rốt băm nhỏ thơm nức mũi.', details: 'Hộp nhựa PP quay được trong lò vi sóng. Cần hâm nóng lại 2 phút trước khi ăn.', storeId: 's10', storeName: 'Tops Market', distance: 3.7, co2Saved: 0.4, mfgDate: '2026-05-26 10:00', expiryDate: '2026-05-27 16:00', nutrition: { calories: 450, protein: 14, carbs: 65, fat: 12, fiber: 3.5 }, ingredients: ['Cơm trắng', 'lạp xưởng', 'trứng gà', 'rau củ hạt lựu', 'gia vị'], originalPrice: 38000, aiPrice: 17100, stock: 6, image: img('1603133876554-3e3c3dac61f3') },
  { id: 'rp26', name: 'Gà quay tiêu kiểu Pháp (Nửa con)', category: 'Meals', discount: 45, freshness: 'fresh', description: 'Gà quay nguyên miếng da vàng giòn thấm đẫm sốt tiêu đen cay nồng, thịt bên trong mềm ngọt.', details: 'Đóng khay bạc giữ nhiệt tốt. Thích hợp ăn ngay cùng cơm nóng hoặc bánh mì.', storeId: 's4', storeName: 'AEON Citimart', distance: 7.2, co2Saved: 0.95, mfgDate: '2026-05-27 08:00', expiryDate: '2026-05-27 21:00', nutrition: { calories: 520, protein: 42, carbs: 5, fat: 35, fiber: 0.8 }, ingredients: ['Gà ta thả vườn', 'sốt tiêu đen', 'tỏi', 'mật ong'], originalPrice: 89000, aiPrice: 48950, stock: 2, image: img('1598101403331-30f710df0076') },
  { id: 'rp27', name: 'Salad ức gà sốt mè rang (Hộp ăn liền)', category: 'Meals', discount: 60, freshness: 'expiring_soon', description: 'Sự kết hợp thanh mát giữa rau xà lách, cà chua bi, ngô ngọt, ức gà xé phay cùng nước sốt mè đậm đà.', details: 'Hộp kèm dĩa và gói sốt riêng biệt. Rau giữ độ giòn tốt, không nẫu.', storeId: 's12', storeName: 'Farmers Market', distance: 1.8, co2Saved: 0.25, mfgDate: '2026-05-26 06:00', expiryDate: '2026-05-27 18:00', nutrition: { calories: 210, protein: 18, carbs: 12, fat: 9, fiber: 4.2 }, ingredients: ['Xà lách', 'ức gà luộc', 'ngô ngọt', 'sốt mè rang Kewpie'], originalPrice: 45000, aiPrice: 18000, stock: 5, image: img('1546069901-3a38a0906d4e') },
  { id: 'rp28', name: 'Đậu hũ non sạch Ichiban', category: 'Meals', discount: 50, freshness: 'fresh', description: 'Đậu hũ làm từ 100% đậu nành không biến đổi gen, kết cấu mướt mịn tựa thạch, nấu canh hẹ cực ngon.', details: 'Cây nhựa đóng kín 250g. Bảo quản lạnh mát từ khi sản xuất.', storeId: 's9', storeName: 'Bách Hóa Xanh', distance: 1.2, co2Saved: 0.1, mfgDate: '2026-05-20 07:00', expiryDate: '2026-05-30 07:00', nutrition: { calories: 76, protein: 8, carbs: 1.9, fat: 4.8, fiber: 0.3 }, ingredients: ['Đậu nành nguyên chất', 'nước', 'chất đông tụ tự nhiên'], originalPrice: 12000, aiPrice: 6000, stock: 10, image: img('1549474840-a3910e5c267a') },
  { id: 'rp29', name: "Kim chi cải thảo cắt lát Ông Kim's", category: 'Meals', discount: 40, freshness: 'fresh', description: 'Kim chi muối chuẩn vị Hàn Quốc, lên men chua vừa tới, giòn rụm và cay tê kích thích vị giác.', details: 'Hộp nhựa 300g. Kim chi càng để lâu sẽ càng chua, thích hợp để nấu canh kim chi thịt ba chỉ.', storeId: 's5', storeName: 'CoopMart', distance: 4.3, co2Saved: 0.2, mfgDate: '2026-05-01 09:00', expiryDate: '2026-06-01 09:00', nutrition: { calories: 15, protein: 1.1, carbs: 2.4, fat: 0.2, fiber: 1.6 }, ingredients: ['Cải thảo', 'ớt bột Hàn Quốc', 'nước mắm', 'tỏi', 'gừng'], originalPrice: 35000, aiPrice: 21000, stock: 8, image: img('1583224967569-4e05731f2468') },
  { id: 'rp30', name: 'Trứng gà tươi sạch Ba Huân (Vỉ 6 quả)', category: 'Dairy', discount: 48, freshness: 'fresh', description: 'Trứng gà sạch được xử lý bằng công nghệ UV hiện đại, lòng đỏ to đậm màu, giàu dinh dưỡng.', details: 'Vỉ giấy tự hủy thân thiện môi trường chứa 6 quả size M. Trứng lành lặn, không nứt vỡ.', storeId: 's1', storeName: 'WinMart+', distance: 2.1, co2Saved: 0.3, mfgDate: '2026-05-20 06:00', expiryDate: '2026-06-03 06:00', nutrition: { calories: 143, protein: 12.6, carbs: 0.7, fat: 9.5, fiber: 0 }, ingredients: ['Trứng gà tươi nguyên quả'], originalPrice: 22000, aiPrice: 11440, stock: 15, image: img('1582722874020-3c17359f0100') },
];

function toIsoExpiry(exp: string): string {
  const [date, time = '00:00'] = exp.split(' ');
  return `${date}T${time}:00`;
}

/** Row shape for Supabase / Postgres `products` table */
export function rescueProductsToDbRows(createdAt = '2026-05-27T08:00:00Z') {
  return RESCUE_PRODUCT_SEEDS.map((p, i) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    stock: p.stock ?? 5,
    original_price: p.originalPrice,
    ai_price: p.aiPrice,
    expiry: p.expiryDate,
    status: 'live',
    image: p.image,
    store_id: p.storeId,
    store_name: p.storeName,
    discount: p.discount,
    created_at: createdAt,
    rating: 4 + (i % 10) / 10,
    review_count: 8 + (i * 3) % 40,
    co2_saved: p.co2Saved,
    rescued_score: p.freshness === 'fresh' ? 88 : p.freshness === 'expiring_soon' ? 75 : 60,
    ingredients: JSON.stringify(p.ingredients),
    allergens: JSON.stringify([]),
    nutrition: JSON.stringify(p.nutrition),
    distance: p.distance,
    description: p.description,
    details: p.details,
    mfg_date: p.mfgDate,
    expiry_date: p.expiryDate,
  }));
}

const RESCUE_IMAGE_BY_ID = new Map(RESCUE_PRODUCT_SEEDS.map((p) => [p.id, p.image]));

export function applyRescueCatalogImages<T extends { id?: string; image?: string }>(
  items: T | T[] | null | undefined
): T | T[] | null | undefined {
  if (items == null) return items;
  const list = Array.isArray(items) ? items : [items];
  const merged = list.map((p) => {
    // Đảm bảo rằng p.id nhận được từ database trùng khớp 100% với định dạng 'rp01', 'rp02'...
    const catalogImage = p.id ? RESCUE_IMAGE_BY_ID.get(p.id) : undefined;
    return catalogImage ? { ...p, image: catalogImage } : p;
  });
  return Array.isArray(items) ? merged : merged[0];
}

/** Client-side Product[] for landing page and demos */
export function rescueProductsToClient(createdAt = '2026-05-27T08:00:00Z'): Product[] {
  return RESCUE_PRODUCT_SEEDS.map((p, i) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    stock: p.stock ?? 5,
    originalPrice: p.originalPrice,
    aiPrice: p.aiPrice,
    expiry: toIsoExpiry(p.expiryDate),
    status: 'live' as const,
    image: p.image,
    storeId: p.storeId,
    storeName: p.storeName,
    discount: p.discount,
    createdAt,
    rating: 4 + (i % 10) / 10,
    reviewCount: 8 + (i * 3) % 40,
    co2Saved: p.co2Saved,
    rescuedScore: p.freshness === 'fresh' ? 88 : p.freshness === 'expiring_soon' ? 75 : 60,
    ingredients: p.ingredients,
    allergens: [],
    nutrition: p.nutrition,
    distance: p.distance,
    description: p.description,
    details: p.details,
    mfgDate: p.mfgDate,
    expiryDate: p.expiryDate,
  }));
}
