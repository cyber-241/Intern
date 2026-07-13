## Description
Vui lòng mô tả ngắn gọn về những thay đổi trong Pull Request này. (Ví dụ: Thêm tính năng Reusable Components, tối ưu hóa truy vấn Backend với AsNoTracking, v.v...)

## Checklist (Mandatory Code Review)
Để đảm bảo chất lượng code theo yêu cầu của Tuần 10, vui lòng kiểm tra các mục sau trước khi merge:

- [ ] Code đã được build và chạy thành công trên môi trường local.
- [ ] Đã tự review code của chính mình (Self-review) để phát hiện các lỗi cơ bản.
- [ ] Code tuân thủ các quy tắc clean code và không có bad smells (ví dụ: magic numbers, duplicate code).
- [ ] Backend: Đã kiểm tra lại các query LINQ có sử dụng `.AsNoTracking()` cho read-only query.
- [ ] Frontend: Đã tách các đoạn code lặp lại thành Reusable Components.
- [ ] Có ít nhất 1 thành viên trong team đã review và approve PR này.

## Related Issues
Link tới các issue liên quan (nếu có).

## Screenshots (Nếu có thay đổi UI)
Vui lòng đính kèm ảnh chụp màn hình UI sau khi thay đổi.
