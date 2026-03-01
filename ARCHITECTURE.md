# 🏗 Architecture Document - Family Coffee POS

Tài liệu mô tả kiến trúc hệ thống quản lý bán hàng cho quán RIN COFFEE.

---

## 📋 App làm gì?

**Family Coffee POS** là hệ thống Point of Sale (POS) được thiết kế dành riêng cho quán cà phê với 1 chi nhánh. Mục tiêu chính:

1. **Thay thế ghi chép thủ công** - Loại bỏ việc ghi order bằng giấy
2. **Nhập order nhanh, chính xác** - Giao diện trực quan, thao tác tối thiểu
3. **Quản lý bàn thời gian thực** - Biết ngay bàn nào đang có khách
4. **Tách/gộp hóa đơn linh hoạt** - Hỗ trợ khách hàng chia bill
5. **Theo dõi doanh thu theo ca** - Báo cáo tức thì cho chủ quán

### Các chức năng chính:
- Hiển thị sơ đồ bàn theo khu vực
- Tạo và quản lý order
- Thanh toán & split bill
- Quản lý ca làm việc tự động
- Dashboard admin với báo cáo doanh thu
- Quản lý menu, bàn, khu vực, nhân viên

---

## 🖥 Frontend dùng gì?

### Core Technologies

| Công nghệ | Version | Mục đích |
|-----------|---------|----------|
| **React** | 19.x | UI Library |
| **TypeScript** | 5.8.x | Type safety |
| **Vite** | 6.x | Build tool & Dev server |
| **Recharts** | 3.x | Biểu đồ doanh thu |

### Styling
- **TailwindCSS** - Utility-first CSS (inline classes)
- **Material Icons** - Icon system

### Project Structure

```
src/
├── app/                    # Application entry & providers
│   ├── App.tsx            # Root component, routing logic
│   └── providers/
│       └── AuthProvider.tsx
│
├── features/               # Feature-based modules
│   ├── pos/               # POS (Point of Sale)
│   │   ├── components/
│   │   │   ├── TableMap.tsx      # Sơ đồ bàn
│   │   │   ├── OrderPanel.tsx    # Màn hình order
│   │   │   └── PaymentModal.tsx  # Thanh toán
│   │   └── hooks/
│   │       └── usePos.ts
│   ├── admin/             # Admin Dashboard
│   │   └── components/
│   │       └── AdminDashboard.tsx
│   └── auth/              # Authentication
│       └── LoginPage.tsx
│
├── domain/                 # Business/Domain logic (pure functions)
│   └── orders/
│       ├── order.logic.ts       # Tính tiền, split bill, merge
│       └── order.validators.ts
│
├── services/               # External integrations
│   └── firebase/
│
├── shared/                 # Shared utilities & types
│   ├── types/index.ts
│   ├── utils/
│   │   ├── money.ts      # Format tiền VND
│   │   ├── date.ts       # Xử lý ngày, ca làm việc
│   │   └── id.ts         # Generate unique IDs
│   └── constants.ts      # Fallback/seed data
│
└── ui/
    └── components/        # Reusable UI components
        └── Modal.tsx
```

### Architecture Pattern
- **Feature-based organization** - Mỗi feature là 1 module độc lập
- **Domain-Driven Design (lite)** - Tách biệt business logic (`domain/`) khỏi UI
- **Repository Pattern** - Data access qua các repo files (`*.repo.ts`)

---

## ⚙️ Backend dùng gì?

### Serverless Architecture với Firebase

**Không có backend server truyền thống.** Ứng dụng sử dụng kiến trúc serverless với Firebase:

```
┌─────────────────┐     ┌─────────────────┐
│  React Frontend │────▶│  Firebase SDK   │
└─────────────────┘     └────────┬────────┘
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
            ┌───────────────┐        ┌───────────────┐
            │  Firestore    │        │  Firebase     │
            │  (Database)   │        │  Auth         │
            └───────────────┘        └───────────────┘
```

### Firebase Services sử dụng

| Service | Mục đích |
|---------|----------|
| **Firebase Auth** | Đăng nhập bằng email/password |
| **Cloud Firestore** | NoSQL database realtime |
| **Firebase Hosting** | Hosting static SPA |

### Tại sao không cần backend server?
- Firestore hỗ trợ **realtime subscriptions** - dữ liệu tự động sync
- **Security Rules** của Firestore xử lý authorization
- Giảm chi phí vận hành cho quán nhỏ

---

## 🗄 Database gì?

### Cloud Firestore (NoSQL)

Firestore là document database với cấu trúc collections/documents.

### Schema Design

```
firestore-root/
├── users/                    # Người dùng
│   └── {userId}
│       ├── name: string
│       ├── role: 'ADMIN' | 'STAFF'
│       └── avatar: string
│
├── categories/               # Nhóm món
│   └── {categoryId}
│       ├── name: string
│       └── icon: string
│
├── products/                 # Sản phẩm/Món
│   └── {productId}
│       ├── name: string
│       ├── price: number
│       ├── category: string (categoryId)
│       ├── image: string
│       └── description: string
│
├── areas/                    # Khu vực
│   └── {areaId}
│       └── name: string
│
├── tables/                   # Bàn
│   └── {tableId}
│       ├── name: string
│       ├── areaId: string
│       ├── area: string (denormalized)
│       ├── status: 'AVAILABLE' | 'OCCUPIED' | 'PAYMENT_REQUESTED'
│       └── currentOrderId: string | null
│
├── orders/                   # Đơn hàng
│   └── {orderId}
│       ├── tableId: string | null
│       ├── type: 'DINE_IN' | 'TAKEAWAY'
│       ├── status: 'OPEN' | 'CLOSED'
│       ├── createdAt: Timestamp
│       ├── totalAmount: number
│       ├── paidAmount: number
│       └── items: OrderItem[]
│           ├── id: string
│           ├── productId: string
│           ├── name: string
│           ├── price: number
│           ├── quantity: number
│           ├── note?: string
│           └── isPaid: boolean
│
└── shifts/                   # Ca làm việc
    └── {shiftId}
        ├── shiftType: 'MORNING' | 'AFTERNOON' | 'EVENING'
        ├── shiftName: string
        ├── date: string (YYYY-MM-DD)
        ├── startTime: Timestamp
        ├── endTime: Timestamp
        └── totalRevenue: number
```

### Data Access Pattern

Mỗi collection có 1 repository file tương ứng:

| Collection | Repository |
|------------|------------|
| users | `users.repo.ts` |
| categories, products | `menu.repo.ts` |
| areas, tables | `tables.repo.ts` |
| orders | `orders.repo.ts` |
| shifts | `shifts.repo.ts` |

Repository cung cấp:
- **subscribe** functions - Realtime listeners
- **CRUD** functions - Create, Read, Update, Delete

---

## 🔐 Auth & Phân quyền

### Authentication

**Firebase Authentication** với phương thức Email/Password.

```typescript
// Login flow
loginWithEmail(email, password)
  → Firebase Auth validate
  → Lấy user profile từ Firestore (users/{uid})
  → Set currentUser trong AuthContext
```

### Authorization (Phân quyền)

Hệ thống có **2 roles**:

| Role | Mô tả |
|------|-------|
| **ADMIN** | Toàn quyền hệ thống |
| **STAFF** | Chỉ được thao tác bán hàng |

### Permission Matrix

| Chức năng | ADMIN | STAFF |
|-----------|-------|-------|
| Xem sơ đồ bàn | ✅ | ✅ |
| Tạo/sửa/hủy order | ✅ | ✅ |
| Thanh toán | ✅ | ✅ |
| Chuyển/tách/gộp bàn | ✅ | ✅ |
| Truy cập Admin Dashboard | ✅ | ❌ |
| Quản lý Menu | ✅ | ❌ |
| Quản lý Bàn/Khu vực | ✅ | ❌ |
| Quản lý Nhân viên | ✅ | ❌ |
| Xem báo cáo doanh thu | ✅ | ❌ |

### Implementation

```tsx
// AuthProvider.tsx - Context quản lý auth state
const AuthContext = createContext<AuthContextType>(...);

// App.tsx - Check role trước khi render Admin
if (view === 'ADMIN') {
  if (currentUser.role !== 'ADMIN') {
    setView('TABLES'); // Redirect STAFF
    return null;
  }
  return <AdminDashboard ... />;
}

// UI conditional - Chỉ ADMIN thấy nút Admin
{currentUser.role === 'ADMIN' && (
  <button onClick={() => setView('ADMIN')}>
    Admin Dashboard
  </button>
)}
```

---

## 📦 Những Module chính

### 1. POS Module (`features/pos/`)

Màn hình chính cho nhân viên phục vụ.

**Components:**
- `TableMap.tsx` - Sơ đồ bàn, filter theo khu vực, search
- `OrderPanel.tsx` - Thêm/sửa món, ghi chú, xem tổng tiền
- `PaymentModal.tsx` - Chọn món thanh toán, split bill, in hóa đơn

### 2. Admin Module (`features/admin/`)

Dashboard cho chủ quán.

**Tabs:**
- Dashboard - Biểu đồ doanh thu, thống kê
- Menu - CRUD categories & products
- Tables - CRUD areas & tables
- Staff - CRUD users
- Bills - Lịch sử hóa đơn

### 3. Auth Module (`features/auth/`)

Xử lý đăng nhập/đăng xuất.

### 4. Domain Module (`domain/orders/`)

Pure business logic, không phụ thuộc UI hay Firebase.

**Functions:**
- `createNewOrder()` - Tạo order mới
- `addItemToOrder()` - Thêm sản phẩm
- `updateItemQuantity()` - Cập nhật số lượng
- `splitBill()` - Tách hóa đơn
- `mergeOrders()` - Gộp orders

### 5. Services Module (`services/firebase/`)

Tầng data access.

**Files:**
- `firebase.ts` - Init Firebase app
- `auth.service.ts` - Login/logout/auth state
- `firestore/*.repo.ts` - Repository cho từng collection

---

## 🔄 Luồng tạo/sửa/xóa dữ liệu quan trọng nhất

### 1. Luồng tạo Order

```
User click bàn trống
       │
       ▼
┌──────────────────────────┐
│ 1. createNewOrder()      │ ← Domain logic
│    (order.logic.ts)      │
└───────────┬──────────────┘
            │ Order data (no ID)
            ▼
┌──────────────────────────┐
│ 2. ordersRepo.createOrder│ ← Firestore
│    (orders.repo.ts)      │
└───────────┬──────────────┘
            │ Return orderId
            ▼
┌──────────────────────────┐
│ 3. tablesRepo.updateTable│
│    status → OCCUPIED     │
│    currentOrderId → new  │
└───────────┬──────────────┘
            │
            ▼
┌──────────────────────────┐
│ 4. Firestore realtime    │
│    → subscribeActiveOrders│
│    → UI auto-update      │
└──────────────────────────┘
```

### 2. Luồng Thanh toán (Split Bill)

```
User chọn món cần thanh toán
       │
       ▼
┌──────────────────────────┐
│ 1. PaymentModal UI       │
│    - Move items to "Pay" │
└───────────┬──────────────┘
            │
            ▼
┌──────────────────────────┐
│ 2. processPayment()      │ ← Firestore Transaction
│    (orders.repo.ts)      │
│                          │
│  Transaction:            │
│  - Mark items isPaid=true│
│  - Update paidAmount     │
│  - Update order status   │
│  - Add revenue to shift  │
└───────────┬──────────────┘
            │ allPaid = true/false
            ▼
┌──────────────────────────┐
│ 3. If allPaid:           │
│    tablesRepo.updateTable│
│    status → AVAILABLE    │
│    currentOrderId → null │
└───────────┬──────────────┘
            │
            ▼
┌──────────────────────────┐
│ 4. UI redirects to       │
│    TableMap              │
└──────────────────────────┘
```

### 3. Luồng CRUD Product (Admin)

```
Admin click "Add Product"
       │
       ▼
┌──────────────────────────┐
│ 1. ProductModal opens    │
│    Fill form data        │
└───────────┬──────────────┘
            │
            ▼
┌──────────────────────────┐
│ 2. onSaveProduct(prod)   │
│    →                     │
│    if (prod.id):         │
│      menuRepo.updateProduct
│    else:                 │
│      menuRepo.addProduct │
└───────────┬──────────────┘
            │
            ▼
┌──────────────────────────┐
│ 3. Firestore realtime    │
│    subscribeProducts()   │
│    → UI list updates     │
└──────────────────────────┘
```

### 4. Luồng tự động tạo Shift

```
User đăng nhập
       │
       ▼
┌──────────────────────────┐
│ 1. getOrCreateCurrentShift│
│    (shifts.repo.ts)      │
│                          │
│  - Lấy giờ hiện tại      │
│  - getCurrentShiftDef()  │
│  - Query Firestore xem   │
│    có shift chưa         │
│  - Nếu chưa → tạo mới    │
└───────────┬──────────────┘
            │
            ▼
┌──────────────────────────┐
│ 2. subscribeCurrentShift │
│    → UI shows shift name │
│    → Revenue updates     │
└──────────────────────────┘

Ca tự động theo khung giờ:
- MORNING:   06:00 - 12:00
- AFTERNOON: 12:00 - 18:00
- EVENING:   18:00 - 24:00
```

---

## 🔌 Tích hợp dịch vụ ngoài nào?

### Firebase Services

| Service | Mục đích | Setup |
|---------|----------|-------|
| **Firebase Auth** | Xác thực người dùng | Email/Password provider |
| **Cloud Firestore** | Database realtime | `.env.local` config |
| **Firebase Hosting** | Deploy static SPA | `firebase.json` |

### Không sử dụng
- ❌ Payment gateway (thanh toán tiền mặt)
- ❌ SMS/Email notifications
- ❌ Cloud Functions (chưa cần)
- ❌ Firebase Storage (ảnh dùng URL external)

### Environment Variables

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

---

## 🚀 Deploy ở đâu?

### Firebase Hosting

Ứng dụng được deploy như **Static SPA** lên Firebase Hosting.

### Deployment Flow

```bash
# 1. Build production
npm run build        # Output: dist/

# 2. Deploy to Firebase
firebase deploy --only hosting
```

### Firebase Hosting Config (`firebase.json`)

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### SPA Rewrite Rule
Tất cả requests được redirect về `index.html` để React Router xử lý client-side routing.

### Production URL
Sau khi deploy, app có thể truy cập tại:
```
https://<project-id>.web.app
https://<project-id>.firebaseapp.com
```

---

## 📊 Diagram tổng quan

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ TableMap    │  │ OrderPanel  │  │ Payment     │  POS    │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         │                │                │                 │
│  ┌──────┴────────────────┴────────────────┴──────┐         │
│  │                   App.tsx                      │         │
│  │              (State Management)                │         │
│  └──────────────────────┬────────────────────────┘         │
│                         │                                   │
│  ┌──────────────────────┴────────────────────────┐         │
│  │              AuthProvider                      │         │
│  │         (Authentication Context)               │         │
│  └──────────────────────┬────────────────────────┘         │
└─────────────────────────┼───────────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────────┐
│                    SERVICES                                 │
│  ┌──────────────────────┴────────────────────────┐         │
│  │           Firebase SDK (v12.9.0)               │         │
│  │  ┌─────────────────┐  ┌─────────────────┐     │         │
│  │  │  auth.service   │  │  *.repo.ts      │     │         │
│  │  └────────┬────────┘  └────────┬────────┘     │         │
│  └───────────┼────────────────────┼──────────────┘         │
└──────────────┼────────────────────┼─────────────────────────┘
               │                    │
┌──────────────┼────────────────────┼─────────────────────────┐
│              │    FIREBASE CLOUD  │                         │
│   ┌──────────▼──────────┐  ┌──────▼───────────┐            │
│   │   Firebase Auth     │  │  Cloud Firestore │            │
│   │  (Authentication)   │  │   (Database)     │            │
│   └─────────────────────┘  └──────────────────┘            │
│                                                             │
│   ┌─────────────────────────────────────────────┐          │
│   │           Firebase Hosting                   │          │
│   │         (Static SPA Deployment)              │          │
│   └─────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔮 Hướng phát triển tương lai

1. **Cloud Functions** - Xử lý logic phức tạp server-side
2. **Firebase Storage** - Upload ảnh sản phẩm
3. **Push Notifications** - Thông báo khi có order mới
4. **Multi-branch** - Mở rộng cho nhiều chi nhánh
5. **Inventory** - Quản lý kho nguyên liệu
6. **Analytics** - Thống kê chi tiết hơn

---

*Tài liệu này được tạo để giúp developer mới hiểu nhanh kiến trúc hệ thống.*
