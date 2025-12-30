
# 🚀 SmartSpend - Personal Finance Manager

SmartSpend là ứng dụng quản lý tài chính cá nhân và nhóm toàn diện, tích hợp trí tuệ nhân tạo (Gemini AI) để giúp người dùng theo dõi chi tiêu, lập kế hoạch ngân sách và nhận lời khuyên tài chính thông minh.

---

## 🛠 Hướng dẫn cài đặt và khởi chạy

### 1. Chuẩn bị
*   Đã cài đặt **Node.js** (Phiên bản 18 trở lên).
*   Có API Key của **Google Gemini** (Lấy tại [Google AI Studio](https://aistudio.google.com/)).

### 2. Các bước khởi chạy

#### Bước 1: Tải mã nguồn
```bash
git clone <url-cua-repo>
cd smartspend
```

#### Bước 2: Cài đặt Dependencies
```bash
npm install
```

#### Bước 3: Thiết lập biến môi trường
Tạo file `.env` ở thư mục gốc (hoặc thiết lập trong terminal):
```env
API_KEY=your_gemini_api_key_here
PORT=5000
```

#### Bước 4: Chạy Backend (Mock Server)
Mở một terminal mới:
```bash
# Sử dụng ts-node-dev để tự động restart khi sửa code
npx ts-node-dev server.ts
```
*Server sẽ chạy tại `http://localhost:5000`.*

#### Bước 5: Chạy Frontend
Mở một terminal khác:
```bash
npm run dev
```
*Mặc định chạy tại `http://localhost:5173`.*

---

## 📂 Cấu trúc thư mục & Nội dung File

### 🏗️ Thư mục Gốc (Root)
*   `index.tsx`: Điểm nhập (Entry point) của React, bao bọc ứng dụng trong `AppProvider`.
*   `App.tsx`: Quản lý Navigation (Router) và bố cục chính của trang web.
*   `server.ts`: **Backend chính**. Chứa logic API và cơ sở dữ liệu giả lập (In-memory DB).
*   `types.ts`: Định nghĩa các Interface và Type cho toàn bộ dự án (User, Transaction, Wallet...).
*   `constants.tsx`: Chứa dữ liệu mẫu, bản đồ Icons và các hằng số cấu hình.
*   `metadata.json`: Thông tin mô tả ứng dụng và quyền truy cập thiết bị.

### 🍱 Thư mục `components/` (UI Reusable)
*   `Sidebar.tsx` & `Header.tsx`: Thanh điều hướng và thanh tiêu đề (chứa thông báo & profile).
*   `Card.tsx`: Thành phần khung chứa nội dung với hiệu ứng Glassmorphism.
*   `Modal.tsx`: Thành phần cửa sổ bật lên cơ sở.
*   `AddTransactionModal.tsx`: **Tính năng nổi bật** - Nhập liệu nhanh bằng AI thông qua Gemini.
*   `ChatbotModal.tsx` & `ChatbotFAB.tsx`: Giao diện tương tác với trợ lý ảo Mony.
*   `charts/`: Chứa các biểu đồ Recharts (Xu hướng chi tiêu, Cơ cấu danh mục).

### 📄 Thư mục `pages/` (Giao diện chính)
*   `Dashboard.tsx`: Tổng quan tài chính, danh sách ví và mục tiêu tiết kiệm.
*   `Transactions.tsx`: Lịch sử giao dịch chi tiết với bộ lọc và tìm kiếm.
*   `Groups.tsx`: Quản lý quỹ nhóm, tự động tính toán số tiền cần trả (Settle up).
*   `DebtsLoans.tsx`: Theo dõi các khoản nợ và cho vay.
*   `Premium.tsx`: Trang phân tích AI chuyên sâu (Dự báo chi tiêu).
*   `Settings.tsx`: Cài đặt tài khoản, giao diện (Light/Dark/Special) và quản lý Danh mục.
*   `admin/`: Chứa các trang quản trị hệ thống (User Management, System Reports).

### ⚙️ Thư mục `services/` & `contexts/`
*   `apiService.ts`: Trung tâm kết nối API. Chứa các hàm `fetch` gọi đến backend.
*   `geminiService.ts`: Xử lý logic AI (Prompt Engineering) cho trợ lý tài chính.
*   `AppContext.tsx`: **Global State Management**. Quản lý dữ liệu toàn cục và các hành động (Actions).

---

## 🛢️ Lộ trình thay thế Database thật

Hiện tại, file `server.ts` sử dụng một biến `db` để lưu trữ dữ liệu. Dữ liệu này sẽ mất khi bạn tắt server. Để đưa ứng dụng vào sử dụng thực tế:

### 1. Kết nối cơ sở dữ liệu (Database)
*   **Lựa chọn**: Sử dụng **PostgreSQL** hoặc **MySQL**.
*   **Công cụ**: Cài đặt **Prisma ORM** (`npm install prisma @prisma/client`).
*   **Thực hiện**:
    1. Chạy `npx prisma init`.
    2. Sao chép các interface trong `types.ts` sang `schema.prisma`.
    3. Trong `server.ts`, thay thế các đoạn code thao tác mảng (ví dụ: `db.users.push(...)`) bằng lệnh Prisma (ví dụ: `await prisma.user.create(...)`).

### 2. Xác thực người dùng (Authentication)
*   Thay thế mã Token giả lập (`mock-jwt-token-...`) bằng Token thật sử dụng thư viện `jsonwebtoken` (JWT).
*   Mã hóa mật khẩu người dùng bằng `bcryptjs` trước khi lưu vào DB.

### 3. Lưu trữ tệp tin (Storage)
*   Thay thế các link ảnh `picsum.photos` bằng dịch vụ lưu trữ ảnh thật như **Cloudinary** hoặc **AWS S3** cho phần ảnh đại diện người dùng.

---

## 🤖 Tính năng AI đặc sắc
*   **Quick Add**: Bạn chỉ cần nhập "ăn tối 100k", AI sẽ tự động phân loại vào danh mục "Ăn uống", chọn loại "Chi tiêu" và tách số tiền 100,000đ.
*   **Trợ lý Mony**: Chat trực tiếp để hỏi "Tháng này tôi đã tiêu bao nhiêu cho cafe?" hoặc "Làm sao để tiết kiệm 5 triệu/tháng?". Mony sẽ phân tích dữ liệu thực tế của bạn để trả lời.
