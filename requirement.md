1\. Mục tiêu hệ thống
---------------------

Phần mềm được xây dựng nhằm thay thế phương pháp ghi món và tính tiền thủ công bằng giấy.Hệ thống tập trung vào:

*   Nhập order nhanh, chính xác
    
*   Quản lý trạng thái bàn
    
*   Hỗ trợ tách/gộp hóa đơn linh hoạt
    
*   Theo dõi doanh thu theo ca và theo thời gian
    
*   Dễ sử dụng cho nhân viên, không yêu cầu nghiệp vụ phức tạp
    

Quán chỉ có **1 chi nhánh**.

Không bao gồm quản lý kho, nhà cung cấp, kế toán hay in hóa đơn.

2\. Vai trò người dùng (User Roles)
-----------------------------------

### Admin

*   Toàn quyền cấu hình hệ thống
    
*   Quản lý danh mục
    
*   Mở/đóng ca
    
*   Xem báo cáo
    

### Nhân viên

*   Tạo và chỉnh sửa order
    
*   Thanh toán
    
*   Chuyển/tách/gộp bàn❌ Không được xem báo cáo
    

3\. Danh mục (Master Data)
--------------------------

### 3.1 Quản lý món

Admin có thể:

*   Thêm món mới
    
*   Sửa thông tin món
    
*   Xóa món
    

Thông tin của món gồm:

*   Tên món
    
*   Giá bán
    
*   Ảnh minh họa
    
*   Mô tả ngắn
    
*   Thuộc nhóm món
    

### 3.2 Nhóm món

Ví dụ:

*   Cà phê
    
*   Trà
    
*   Sinh tố
    
*   Nước ép
    

Admin được phép thêm / sửa / xóa.

### 3.3 Option / Topping / Ghi chú

Hệ thống **không quản lý danh sách topping riêng**.

Khi order, nhân viên chỉ cần nhập **ghi chú tự do**, ví dụ:

*   ít đá
    
*   không đường
    
*   thêm sữa
    

### 3.4 Bàn & Khu vực

Admin có thể:

*   Tạo khu vực (tầng 1, sân vườn…)
    
*   Thêm bàn
    
*   Sửa tên/số bàn
    
*   Xóa bàn
    

Mỗi bàn có trạng thái:

*   Trống
    
*   Đang phục vụ
    
*   Đã yêu cầu thanh toán
    

4\. Bán hàng / POS (trọng tâm hệ thống)
---------------------------------------

### 4.1 Tạo order

Nhân viên có thể tạo order theo:

*   Bàn
    
*   Mang đi
    

Khi chọn bàn → hiển thị danh sách món để thêm.

Mỗi món có thể:

*   Tăng số lượng (+)
    
*   Giảm số lượng (-)
    
*   Thêm ghi chú
    

Nếu giảm về **0** → xem như **hủy món**.

### 4.2 Trong quá trình phục vụ

Có thể:

*   Thêm món mới
    
*   Bớt món
    
*   Chỉnh sửa ghi chú
    

Hệ thống luôn tự động cập nhật tổng tiền.

### 4.3 Chuyển bàn

Cho phép chuyển toàn bộ order từ bàn A sang bàn B.

### 4.4 Gộp bàn

Ví dụ: 2 bàn nhập lại thành 1.

→ Hệ thống gộp tất cả món và tính chung.

### 4.5 Tách hóa đơn (Split bill)

Ví dụ:

*   Bàn có 5 món
    
*   Khách muốn trả trước 2 món
    

Nhân viên chọn các món cần thanh toán → hệ thống ghi nhận:

*   Các món đó = đã thanh toán
    
*   Các món còn lại = chưa thanh toán
    

### 4.6 Thanh toán

Khi chọn thanh toán:

Hệ thống:

1.  Hiển thị danh sách món chưa thanh toán
    
2.  Nhân viên xác nhận
    
3.  Bấm nút **Thanh toán**
    

Sau đó:

*   Ghi nhận hóa đơn đã thanh toán
    
*   Cập nhật doanh thu
    
*   Nếu tất cả món đã trả → bàn trở lại trạng thái trống
    

❌ Không cần:

*   Chọn phương thức thanh toán
    
*   In bill
    

5\. Ca làm & Chốt ca
--------------------

### 5.1 Mở ca

Admin mở ca khi bắt đầu làm việc.

Nhân viên chỉ được bán hàng khi có ca đang mở.

### 5.2 Đóng ca

Khi kết thúc:

*   Hệ thống tổng hợp toàn bộ hóa đơn trong ca
    
*   Tính tổng doanh thu
    

### 5.3 Doanh thu theo ca

Mỗi ca lưu:

*   Thời gian mở
    
*   Thời gian đóng
    
*   Tổng tiền thu được
    

6\. Báo cáo (Admin only)
------------------------

### 6.1 Theo thời gian

*   Doanh thu ngày
    
*   Doanh thu tuần
    
*   Doanh thu tháng
    

### 6.2 Theo ca

*   Liệt kê từng ca
    
*   Tổng tiền từng ca
    

7\. Phân quyền
--------------

Hệ thống có 2 mức:

### Admin

✔ cấu hình✔ xem báo cáo✔ thao tác bán hàng

### Nhân viên

✔ bán hàng✔ thanh toán✔ chuyển/tách/gộp bàn❌ không xem báo cáo

8\. Yêu cầu ưu tiên của hệ thống
--------------------------------

Vì là quán gia đình, hệ thống cần:

*   Dễ học, dễ dùng
    
*   Thao tác nhanh
    
*   Hạn chế nhập liệu phức tạp
    
*   Tránh sai sót tiền bạc
    
*   Nhìn vào là biết ngay bàn nào đang có khách
###
Yêu cầu hệ thống: Tổ chức cấu trúc mã nguồn tham khảo theo cấu trúc sau:
* src/
  app/
    App.tsx
    routes.tsx
    providers/              (AuthProvider, QueryProvider nếu có)
  ui/
    components/             (Button, Modal, Tabs, Card... đồ UI thuần)
    layouts/
  features/
    pos/
      pages/
        PosPage.tsx
      components/
        TableMap.tsx
        OrderPanel.tsx
        PaymentModal.tsx
      hooks/
        usePos.ts            (logic điều phối cho màn POS)
      pos.types.ts
      pos.selectors.ts       (hàm lấy dữ liệu “đúng format cho UI”)
    admin/
      pages/
      components/
  domain/
    menu/
      menu.model.ts
    tables/
      table.model.ts
    orders/
      order.model.ts
      order.logic.ts         (tính tiền, split bill, merge...)
      order.validators.ts    (validate input)
  services/
    firebase/
      firebase.ts            (init)
      auth.service.ts
      firestore/
        menu.repo.ts
        tables.repo.ts
        orders.repo.ts
    payments/                (nếu sau này có)
  shared/
    constants.ts
    utils/
      money.ts
      date.ts
      id.ts
    types/
      index.ts
