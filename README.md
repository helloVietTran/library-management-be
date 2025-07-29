### 📚 Về dự án - Library management website - Vbrary

Một hệ thống quản lý thư viện giúp quản lý sách, độc giả, mượn trả sách. 

### Tính năng chính
- Hỗ trợ gửi email khi người dùng quá hạn trả sách
- Quản lý sách (thêm, sửa, xoá, tìm kiếm)
- Quản lý người dùng (đăng ký, cập nhật thông tin, xoá)
- Quản lý mượn/trả sách
- Phân quyền theo loại người dùng (với 3 loại người dùng)
- Cung cấp một số thống kê dưới dạng số liệu và bảng biểu về tình hình thư viện: biến động mượn trả, thống kê sách theo lượt mượn
- Cung cấp 1 Chat App đơn giản
- Xác thực bằng JWT, refresh token
- Tải file .pdf, .xlsx chứa thông tin sách và tác giả

### Công việc thực hiện
- Phân tích bài toán quản lý thư viện
- Thiết kế và xây dựng API RESTful
- Xây dựng cơ sở dữ liệu MongoDB và xác định mối quan hệ tham chiếu giữa các collection
- Tích hợp dịch vụ bên ngoài: Email Service
- Viết unit test bằng Jest cho dự án
- Viết các truy vấn thống kê, và tối ưu truy vấn MongoDB bằng cách sử dụng lean
- Triển khai xác thực và phân quyền người dùng bằng JWT

### 🛠️ Công nghệ nổi bật
    Node.js, Express.js, TypeScript, MongoDB, Joi, Cloudinary
    
### 📌Hướng Dẫn Cài Đặt và Chạy Dự Án

Để clone dự án từ GitHub về máy tính của bạn, làm theo các bước sau:

1. Mở terminal trong Visual Studio Code
   ```bash
   git clone https://github.com/helloVietTran/library-management-be
2. Di chuyển tới thư mục dự án
   ```bash
   cd library-management-be

5. Chạy câu lệnh sau để cài các package cần thiết
     ```bash
     npm install
6. Để chạy dự án, chạy tiếp lệnh sau
     ```bash
     npm run dev
     ```
    
### 👤 Thông tin tài khoản test 
📌 Admin: tài khoản: admin@gmail.com | mật khẩu: admin123




   
    
   
   
