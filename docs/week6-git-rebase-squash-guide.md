# Hướng dẫn Thực hành: Git Rebase và Squash (Tuần 6)

Trong tuần 6, chúng ta cần tìm hiểu về `Git Rebase` và `Squash commits`. Đây là những kỹ năng Git nâng cao giúp làm sạch lịch sử commit trước khi merge vào nhánh chính.

Dưới đây là kịch bản để bạn tự thực hành trực tiếp trên terminal của máy tính.

---

## 1. Mục đích của Squash & Rebase
- **Squash**: Gộp nhiều commit nhỏ, vụn vặt (ví dụ: `fix bug`, `update css`, `typo`) thành một commit duy nhất có ý nghĩa trọn vẹn (ví dụ: `feat: add employee management feature`). Giúp lịch sử Git gọn gàng.
- **Rebase**: Viết lại lịch sử commit. Thường dùng để cập nhật nhánh làm việc của mình theo nhánh `main` mới nhất một cách tuyến tính (không tạo ra merge commit rác).

---

## 2. Kịch bản Thực hành Squash Commits (Interactive Rebase)

Mục tiêu: Tạo 3 commits rác, sau đó gộp (squash) chúng lại thành 1 commit duy nhất.

### Bước 1: Di chuyển vào thư mục Frontend và tạo nhánh mới
Mở Terminal, chạy lệnh sau để vào đúng thư mục có Git (Frontend) và tạo nhánh:
```bash
cd c:/Users/Admin/Desktop/intern/angular-intern
git checkout -b feature/practice-squash
```

### Bước 2: Tạo ra các commit rác
Làm lần lượt các lệnh sau để tạo 3 file và 3 commit:
```bash
echo "test 1" > test1.txt
git add test1.txt
git commit -m "wip: add test1"

echo "test 2" > test2.txt
git add test2.txt
git commit -m "wip: add test2"

echo "test 3" > test3.txt
git add test3.txt
git commit -m "wip: add test3"
```
Kiểm tra lịch sử:
```bash
git log --oneline -n 4
```
Bạn sẽ thấy 3 commit có chữ `wip:` nằm trên cùng.

### Bước 3: Thực hiện Interactive Rebase để Squash
Ta sẽ gộp 3 commit gần nhất. Chạy lệnh:
```bash
git rebase -i HEAD~3
```

Một trình soạn thảo (Vim/Nano/VSCode) sẽ mở ra, trông giống thế này:
```text
pick 1a2b3c4 wip: add test1
pick 5d6e7f8 wip: add test2
pick 9g0h1i2 wip: add test3
```

**Hành động của bạn:**
- Giữ nguyên chữ `pick` ở dòng đầu tiên.
- Đổi chữ `pick` thành `s` (hoặc `squash`) ở các dòng bên dưới.
Sửa thành:
```text
pick 1a2b3c4 wip: add test1
s 5d6e7f8 wip: add test2
s 9g0h1i2 wip: add test3
```
Lưu và đóng file (nếu dùng Vim: bấm `Esc`, gõ `:wq`, `Enter`).

### Bước 4: Đặt tên cho Commit mới
Trình soạn thảo sẽ mở ra lần 2 yêu cầu bạn viết message cho commit gộp. Xóa hết các dòng cũ và viết 1 dòng duy nhất:
```text
feat: add all test files at once
```
Lưu và đóng file.

### Bước 5: Kiểm tra kết quả
```bash
git log --oneline -n 2
```
Bạn sẽ thấy 3 commit rác đã biến mất, thay bằng 1 commit duy nhất `feat: add all test files at once`.

---

## 3. Kịch bản Thực hành Rebase (thay vì Merge)

Mục tiêu: Cập nhật code mới nhất từ `main` vào nhánh hiện tại mà không tạo Merge Commit.

### Bước 1: Giả lập có code mới trên nhánh main
```bash
git checkout main
echo "update from main" > main-update.txt
git add main-update.txt
git commit -m "chore: update main branch"
```

### Bước 2: Quay lại nhánh feature của bạn
```bash
git checkout feature/practice-squash
```

### Bước 3: Rebase nhánh feature lên trên main
```bash
git rebase main
```
Git sẽ tạm thời cất các commit của bạn đi, kéo commit mới của `main` về, và đắp các commit của bạn lên trên cùng. Lịch sử lúc này hoàn toàn là một đường thẳng!

> **Lưu ý:** Nếu có Conflict (xung đột file), Git sẽ dừng lại báo lỗi. Bạn cần:
> 1. Mở file bị lỗi, sửa code (chọn giữ lại của ai).
> 2. Chạy `git add <tên-file>`
> 3. Chạy `git rebase --continue` (TUYỆT ĐỐI KHÔNG CHẠY `git commit` LÚC NÀY).

### Bước 4: Dọn dẹp
Khi đã thành thạo, bạn có thể xóa nhánh thực hành:
```bash
git checkout main
git branch -D feature/practice-squash
```

Chúc bạn thực hành thành công!
