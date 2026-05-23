# 📚 F.R.E.S.H System Documentation
## Kiến Trúc Hệ Thống, Logic & Luồng Hoạt Động (Flow)

Tài liệu này mô tả chi tiết chức năng, logic nghiệp vụ, và các luồng hoạt động của 3 phân hệ chính trong nền tảng F.R.E.S.H (Food Rescue – ESG – Smart Hyperlocal): **Customer Portal**, **Partner Portal**, và **Admin Portal**.

---

## 🗺️ 1. Tổng Quan Kiến Trúc Hệ Thống (System Architecture)

Hệ thống F.R.E.S.H được phát triển dựa trên kiến trúc Next.js App Router (Fullstack) kết hợp dịch vụ cơ sở dữ liệu Supabase (PostgreSQL).

```mermaid
graph TD
    subgraph Client [Frontend - Next.js App]
        C[Customer Portal]
        P[Partner Portal]
        A[Admin Portal]
    end

    subgraph Server [Backend - Next.js Route Handlers]
        M[Middleware - Auth & Session]
        API_Auth[API Auth /api/auth/*]
        API_Orders[API Orders /api/orders/*]
        API_Products[API Products /api/products/*]
        API_TX[API Transactions /api/transactions/*]
    end

    subgraph Database [Storage Layer]
        DB[(Supabase PostgreSQL)]
    end

    C & P & A --> M
    M --> API_Auth & API_Orders & API_Products & API_TX
    API_Auth & API_Orders & API_Products & API_TX --> DB
```

---

## 🔄 2. Các Luồng Hoạt Động Chính (Core System Flows)

### 2.1 Luồng Xác Thực & Phân Quyền (Auth & Session Flow)
Next.js Middleware chặn các request để xác thực session token (`fresh_session`). Mỗi portal yêu cầu các role tương ứng:
*   `/customer` yêu cầu role `customer`.
*   `/partner` yêu cầu role `partner`.
*   `/admin` yêu cầu role `admin`.

```mermaid
sequenceDiagram
    actor User as Người dùng
    participant Client as Browser (Next.js)
    participant MW as Middleware.ts
    participant API as /api/auth/me
    participant DB as Supabase DB

    User->>Client: Truy cập trang Portal
    Client->>MW: Gửi request + Cookie session
    alt Không có Cookie
        MW-->>Client: Redirect về /login tương ứng
    else Có Cookie
        MW->>API: Xác thực session token
        API->>DB: Truy vấn thông tin User
        DB-->>API: Trả về thông tin + Role
        alt Role không khớp với Portal
            API-->>MW: Trả về HTTP 403 Forbidden
            MW-->>Client: Redirect về trang Login
        else Role hợp lệ
            MW-->>Client: Cho phép truy cập trang Portal
        end
    end
```

---

### 2.2 Luồng Đặt Hàng & Ví Điện Tử (Order & Wallet Flow)
Đây là luồng nghiệp vụ quan trọng nhất của hệ thống, xử lý đồng bộ giao dịch từ lúc Khách hàng đặt hàng cho đến khi Đối tác nhận tiền.

```mermaid
sequenceDiagram
    actor Customer as Khách hàng (Customer)
    participant Client as Customer App UI
    participant API as /api/orders (POST)
    participant DB as PostgreSQL (Supabase)
    actor Partner as Đối tác (Partner)

    Customer->>Client: Bấm "Cứu Ngay" (Rescue Now)
    Client->>API: Gửi sản phẩm + Thông tin ví
    API->>DB: 1. Kiểm tra tồn kho sản phẩm (SELECT FOR UPDATE)
    alt Hết hàng (Stock = 0)
        DB-->>API: Báo lỗi hết hàng
        API-->>Client: HTTP 400 - Đã hết hàng
    else Còn hàng
        API->>DB: 2. Kiểm tra số dư ví (wallet_balance)
        alt Số dư < Giá trị đơn hàng
            DB-->>API: Báo lỗi số dư không đủ
            API-->>Client: HTTP 400 - Yêu cầu nạp tiền
        else Đủ số dư
            API->>DB: 3. Trừ tiền ví Khách hàng
            API->>DB: 4. Ghi nhận giao dịch ví (type: 'payment')
            API->>DB: 5. Trừ số lượng tồn kho sản phẩm (Stock - 1)
            API->>DB: 6. Tạo Đơn hàng (status: 'pending')
            API->>DB: 7. Tạo các bước Tracking (pending -> delivered)
            DB-->>API: Xác nhận giao dịch thành công (ACID Transaction)
            API-->>Client: HTTP 201 Created - Đơn hàng đã tạo
            Client-->>Customer: Hiển thị Đặt hàng thành công!
            Note over DB, Partner: Đối tác thấy đơn hàng mới ở trạng thái Chờ xác nhận
        end
    end
```

---

### 2.3 Luồng Cập Nhật Đơn Hàng & Doanh Thu Đối Tác (Order Fulfillment & Revenue Flow)
Khi đối tác giao hàng thành công, doanh thu sẽ được tự động cộng vào ví của Đối tác.

```mermaid
sequenceDiagram
    actor Partner as Đối tác (Partner)
    participant PartnerUI as Partner Hub UI
    participant API as /api/orders/update-status (PATCH)
    participant DB as PostgreSQL (Supabase)

    Partner->>PartnerUI: Click "Xác nhận đã giao" (delivered)
    PartnerUI->>API: Gửi orderId + status: 'delivered'
    API->>DB: 1. Cập nhật trạng thái đơn hàng = 'delivered'
    API->>DB: 2. Tính toán hoa hồng hệ thống (Commission %)
    API->>DB: 3. Cộng tiền thực nhận vào ví Đối tác
    API->>DB: 4. Tạo giao dịch ví cho Đối tác (type: 'revenue')
    DB-->>API: Hoàn tất giao dịch
    API-->>PartnerUI: HTTP 200 - Trạng thái thành công
    PartnerUI-->>Partner: Cập nhật UI + Cộng doanh thu ví
```

---

## 📱 3. Phân Hệ Khách Hàng (Customer Portal - `/customer`)

Phân hệ dành cho người tiêu dùng cuối, giúp tìm kiếm và giải cứu thực phẩm dư thừa sắp hết hạn sử dụng.

### 3.1 Các Tính Năng Chính
*   **Bản đồ Radar Ưu đãi**: Quét và định vị vị trí các cửa hàng đối tác (WinMart, Circle K,...) có thực phẩm giải cứu trong bán kính gần.
*   **Ví FRESH VIP**: Quản lý số dư, nạp tiền nhanh qua giả lập Momo/VNPAY để thực hiện thanh toán "Cứu Ngay" tức thì.
*   **Green Credit & ESG Impact**: Theo dõi chỉ số lượng thực phẩm đã cứu (kg) và lượng khí thải CO₂ đã giảm thiểu tương ứng (1kg thực phẩm giải cứu ~ 2.5kg CO₂).
*   **Lọc & Tìm Kiếm Thông Minh**: Lọc thực phẩm theo danh mục (Bakery, Dairy, Fruits, Meals,...) và thời gian hết hạn (Flash Deals).
*   **Hộp Quà & Phần Thưởng**: Đổi điểm tích lũy (Green Credits) lấy voucher giảm giá.

### 3.2 Logic & API Tương Tác
*   `GET /api/products`: Lấy danh sách sản phẩm có trạng thái `live` và còn hạn sử dụng.
*   `POST /api/orders`: Thực hiện tạo đơn hàng và trừ tiền ví tự động.
*   `POST /api/transactions`: Nạp tiền giả lập vào ví (`type: 'topup'`).

---

## 🏪 4. Phân Hệ Đối Tác (Partner Portal - `/partner`)

Giao diện chuyên biệt dành cho các cửa hàng, siêu thị để quản lý hàng tồn kho dư thừa và tối ưu hóa doanh thu.

### 4.1 Các Tính Năng Chính
*   **Quét Barcode AI (AI Scanner)**: Nhận diện mã vạch sản phẩm, tự động phân loại danh mục, ngày hết hạn và đề xuất mức giá giảm tối ưu bằng AI.
*   **AI Dynamic Pricing**: Logic giảm giá linh hoạt dựa trên thời gian hết hạn của sản phẩm (ví dụ: còn 12 giờ giảm 30%, còn 4 giờ giảm 60% để giải phóng kho).
*   **Quản Lý Kho Hàng**: Theo dõi số lượng tồn kho thực phẩm, trạng thái hiển thị (Live, Out of stock).
*   **Quản Lý Đơn Hàng Realtime**: Tiếp nhận đơn hàng từ Khách hàng, cập nhật các bước chuẩn bị hàng (`preparing` $\rightarrow$ `ready` $\rightarrow$ `delivered`).
*   **Báo Cáo Tài Chính (Finance)**: Biểu đồ doanh thu hàng ngày, theo dõi lịch sử giao dịch và rút tiền doanh thu về tài khoản ngân hàng liên kết.

### 4.2 Logic & API Tương Tác
*   `GET /api/orders/by-store?storeId=...`: Lấy danh sách đơn hàng khách đặt tại cửa hàng này.
*   `PATCH /api/orders/update-status`: Cập nhật trạng thái chuẩn bị và bàn giao đơn hàng.
*   `POST /api/products`: Đăng tải sản phẩm giải cứu mới lên hệ thống.

---

## 🛡️ 5. Phân Hệ Quản Trị (Admin Portal - `/admin`)

Trung tâm điều hành trung ương (Console) giúp doanh nghiệp giám sát toàn hệ thống, theo dõi dữ liệu phát triển bền vững (ESG) và bảo mật.

### 5.1 Các Tính Năng Chính
*   **ESG Metrics & CO₂ Dashboard**: Tổng hợp tổng lượng thực phẩm đã được giải cứu và lượng CO₂ cắt giảm trên toàn bộ mạng lưới hyperlocal.
*   **Quản Lý Thành Viên & Phân Quyền**: Kích hoạt, tạm ngưng hoặc cấm (Ban/Unban) tài khoản của Khách hàng hoặc Cửa hàng đối tác.
*   **Cyber Terminal & Log Auditor**: Giám sát log hệ thống realtime (giả lập bảo mật tường lửa, rate limit, kiểm tra kết nối database).
*   **Liên Kết Tài Khoản Ngân Hàng**: Quản lý tài khoản ngân hàng của Khách hàng phục vụ nạp/rút tiền tự động.
*   **Heatmap & Phân Tích Khu Vực**: Bản đồ mật độ giải cứu thực phẩm giữa các quận/huyện để định hướng mở rộng đối tác.
*   **AI Fraud Monitoring**: Phát hiện các giao dịch hoặc tài khoản có hành vi bất thường, spam đơn hàng.

### 5.2 Logic & API Tương Tác
*   `GET /api/users`: Lấy danh sách toàn bộ người dùng trong hệ thống.
*   `PATCH /api/users`: Thay đổi trạng thái tài khoản (`active`, `suspended`, `banned`).
*   `GET /api/bank-accounts`: Truy vấn tài khoản ngân hàng liên kết của từng User.

---

## 🔒 6. Cơ Chế Bảo Mật & Tối Ưu Hiệu Năng

1.  **Giao Dịch ACID (Database Transaction)**: Mọi thao tác đặt hàng, trừ tiền ví khách hàng, trừ tồn kho sản phẩm đều được bọc trong một Database Transaction duy nhất. Nếu một bước thất bại, toàn bộ quá trình sẽ được rollback để tránh mất mát tiền bạc hoặc lệch tồn kho (Race Condition).
2.  **Rate Limiter**: API Gateways ngăn chặn các hành vi brute-force và spam request đặt hàng liên tục.
3.  **Tắt Kiểm Tra Tĩnh Khi Deploy**: File `next.config.mjs` được thiết lập bỏ qua lỗi kiểm tra linting và TypeScript trong quá trình compile để đảm bảo thời gian triển khai Vercel tối ưu nhất (chỉ mất ~14 giây để compile thành công).
