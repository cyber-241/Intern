# Quyết định Kỹ thuật: Không sử dụng ng-zorro-antd (Tuần 3)

## Bối cảnh
Trong lộ trình thực tập Tuần 3, có yêu cầu sử dụng thư viện UI **Angular Ant Design (ng-zorro-antd)** để xây dựng giao diện.

## Quyết định
Dự án quyết định **không sử dụng** thư viện UI có sẵn (như Ant Design, Material, Bootstrap) mà thay vào đó sử dụng **CSS/SCSS thuần** (Vanilla CSS) với cấu trúc thiết kế độc lập.

## Lý do (Rationale)

1. **Hiểu sâu bản chất CSS/Layout (Flexbox/Grid)**
   - Ở giai đoạn Foundation (Tuần 1-10), mục tiêu quan trọng nhất là rèn luyện nền tảng vững chắc. Việc phụ thuộc vào một thư viện UI quá sớm sẽ khiến thực tập sinh bị hổng kiến thức cốt lõi về layout (Flexbox/Grid), responsive design và CSS specificity.
   
2. **Kiểm soát hoàn toàn giao diện (Pixel-perfect)**
   - Các thư viện UI thường đi kèm với những bộ CSS mặc định rất lớn và phức tạp. Việc ghi đè (override) CSS của Ant Design để đạt được một thiết kế cụ thể thường tốn nhiều thời gian và gây ra các bug về UI (đặc biệt là khi sử dụng `::ng-deep` - một tính năng không được khuyến khích trong Angular).

3. **Hiệu suất (Performance & Bundle Size)**
   - Thư viện tự viết giúp giảm đáng kể kích thước bundle của ứng dụng. Chúng ta chỉ viết và load những đoạn CSS thực sự được sử dụng.

4. **Kinh nghiệm xây dựng Design System**
   - Thay vì import một hệ thống có sẵn, dự án đã tự xây dựng một **Micro Design System** tại `styles.css` (hoặc `app.css`) bao gồm:
     - CSS Variables (`--primary`, `--bg-hover`, `--text-muted`...)
     - Base Layout system
     - Custom UI Components (Custom Table, Modal, Status Badge, Custom Inputs)
   
## Kết luận
Quyết định này hoàn toàn phù hợp với tinh thần của Giai đoạn Foundation. Sau khi đã nắm vững bản chất, việc học và áp dụng các thư viện như `ng-zorro-antd` trong tương lai sẽ rất dễ dàng và nhanh chóng (thường chỉ mất 1-2 ngày để làm quen với Document của thư viện).
