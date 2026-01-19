# 📚 Về dự án - Library management website - Vbrary

Một hệ thống quản lý thư viện giúp quản lý sách, độc giả, mượn trả sách giải quyết vấn đề bất cập khi quản lý thủ công thư viện

## 📌 I. Một số bài toán đã giải quyết

### Thông báo người dùng khi sắp đến hạn trả sách

**Bài toán**
- Người dùng thường quên hạn trả sách, dẫn đến quá hạn và khó quản lý
- Cần một cơ chế **chủ động nhắc nhở** để giảm tình trạng trả sách trễ

**Giải pháp**
- Lưu thời điểm mượn và hạn trả sách trong collection `borrow_records`
- Cron job chạy định kỳ (hàng ngày):
  - Kiểm tra các bản ghi **sắp đến hạn trả** (ví dụ: còn 1–2 ngày)
  - Tự động gửi email nhắc nhở đến người dùng

**Luồng xử lý**
1. Cron job truy vấn các lượt mượn chưa trả
2. Lọc các bản ghi gần đến hạn
3. Gửi email thông báo qua Email Service
4. Đánh dấu đã gửi để tránh gửi trùng

**Lợi ích**
- Giảm số lượng sách trả trễ
- Nâng cao trải nghiệm người dùng
- Giúp thư viện quản lý mượn/trả hiệu quả hơn

---

## II. Tính năng chính
- Hỗ trợ gửi email khi người dùng quá hạn trả sách
- Quản lý sách (thêm, sửa, xoá, tìm kiếm)
- Quản lý người dùng (đăng ký, cập nhật thông tin, xoá)
- Quản lý mượn/trả sách
- Phân quyền theo loại người dùng (với 3 loại người dùng)
- Cung cấp một số thống kê dưới dạng số liệu và bảng biểu về tình hình thư viện: biến động mượn trả, thống kê sách theo lượt mượn
- Cung cấp 1 Chat App đơn giản
- Xác thực bằng JWT, refresh token
- Tải file .pdf, .xlsx chứa thông tin sách và tác giả

## III. Công việc thực hiện ở backend
- Thiết kế và xây dựng API RESTful
- Xây dựng cơ sở dữ liệu MongoDB và xác định mối quan hệ tham chiếu giữa các collection
- Xây dựng schema để validate request bằng Joi
- Xây dựng middleware để xác thực, phân quyền và upload file ảnh
- Tích hợp dịch vụ bên ngoài: Email Service
- Viết một số unit test bằng Jest cho dự án
- Viết các truy vấn thống kê, và tối ưu truy vấn MongoDB bằng cách sử dụng lean
- Triển khai xác thực và phân quyền người dùng bằng JWT cho 3 loại người dùng
- Quản lý interface typescript tập trung

## 🛠️ IV. Công nghệ nổi bật
    Node.js, Express.js, TypeScript, MongoDB, Joi, Cloudinary, Jest
    
## V. Hướng Dẫn Cài Đặt và Chạy Dự Án

Để clone dự án từ GitHub về máy tính của bạn, làm theo các bước sau:

1. Mở terminal trong Visual Studio Code
   ```bash
   git clone https://github.com/helloVietTran/library-management-be
   cd library-management-be
   ```

2. Cài đặt thư viện và chạy dự án
     ```bash
     npm install
     npm run dev
     ```   
