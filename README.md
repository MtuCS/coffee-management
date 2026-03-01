# ☕ Family Coffee POS

Hệ thống quản lý bán hàng (Point of Sale) dành cho quán cà phê gia đình. Phần mềm được xây dựng nhằm thay thế phương pháp ghi món và tính tiền thủ công bằng giấy.

## 🎯 Tính năng chính

### Quản lý bàn & Order
- Hiển thị sơ đồ bàn theo khu vực (tầng 1, sân vườn, gác...)
- Trạng thái bàn: Trống / Đang phục vụ / Yêu cầu thanh toán
- Tạo order nhanh theo bàn hoặc mang đi
- Thêm/bớt món, cập nhật ghi chú tự do (ít đá, không đường...)

### Thanh toán linh hoạt
- Thanh toán toàn bộ hoặc tách hóa đơn (split bill)
- In hóa đơn trực tiếp từ trình duyệt (khổ 80mm)
- Tự động cập nhật trạng thái bàn sau thanh toán

### Quản lý ca làm việc
- Hệ thống tự động tạo ca theo khung giờ (Sáng/Chiều/Tối)
- Theo dõi doanh thu realtime theo ca
- Lịch sử các ca làm việc

### Admin Dashboard
- Quản lý Menu (Category & Product)
- Quản lý Bàn & Khu vực
- Quản lý Nhân viên
- Báo cáo doanh thu theo ngày/tuần/tháng
- Xem lịch sử hóa đơn

## 🛠 Công nghệ sử dụng

| Thành phần | Công nghệ |
|------------|-----------|
| Frontend | React 19 + TypeScript |
| Build Tool | Vite |
| Backend | Firebase (Serverless) |
| Database | Cloud Firestore |
| Authentication | Firebase Auth |
| Hosting | Firebase Hosting |
| Charts | Recharts |

## 📁 Cấu trúc thư mục

```
src/
├── app/                    # Entry point & Providers
│   ├── App.tsx
│   └── providers/
├── features/               # Tính năng theo module
│   ├── pos/               # Màn hình POS (order, payment)
│   ├── admin/             # Dashboard admin
│   └── auth/              # Đăng nhập
├── domain/                 # Business logic
│   └── orders/            # Logic xử lý order
├── services/               # Tích hợp bên ngoài
│   └── firebase/          # Firebase config & repos
├── shared/                 # Dùng chung
│   ├── types/             # TypeScript interfaces
│   ├── utils/             # Hàm tiện ích
│   └── constants.ts       # Dữ liệu mẫu
└── ui/
    └── components/        # UI components tái sử dụng
```

## 🚀 Bắt đầu

### Yêu cầu hệ thống
- Node.js 18+
- npm hoặc yarn

### Cài đặt

```bash
# Clone repository
git clone <repo-url>
cd "Coffee Management"

# Cài đặt dependencies
npm install
```

### Cấu hình Firebase

Tạo file `.env.local` với các biến môi trường:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Chạy ứng dụng

```bash
# Chạy development server
npm run dev

# Build production
npm run build

# Preview production build
npm run preview
```

### Seed dữ liệu mẫu

```bash
npm run seed
```

## 🔐 Phân quyền

| Quyền | Admin | Staff |
|-------|-------|-------|
| Tạo/sửa/xóa order | ✅ | ✅ |
| Thanh toán | ✅ | ✅ |
| Chuyển/tách/gộp bàn | ✅ | ✅ |
| Quản lý menu | ✅ | ❌ |
| Quản lý bàn/khu vực | ✅ | ❌ |
| Quản lý nhân viên | ✅ | ❌ |
| Xem báo cáo | ✅ | ❌ |

## 📱 Deploy

Ứng dụng được deploy lên Firebase Hosting:

```bash
# Build và deploy
npm run build
firebase deploy --only hosting
```

## 📝 Ghi chú

- Hệ thống được thiết kế cho **1 chi nhánh** duy nhất
- **Không** bao gồm: quản lý kho, nhà cung cấp, kế toán
- Hỗ trợ in hóa đơn khổ 80mm qua trình duyệt (không cần driver)

## 📄 License

Private - Family Coffee POS
