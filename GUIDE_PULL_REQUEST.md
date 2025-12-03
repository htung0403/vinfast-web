# Hướng dẫn tạo Pull Request trên GitHub

## Cách 1: Tạo Pull Request từ GitHub (Khuyến nghị)

### Bước 1: Tạo branch mới cho thay đổi của bạn

```bash
# Tạo và chuyển sang branch mới
git checkout -b feature/ten-branch-moi

# Hoặc nếu bạn đã có thay đổi, tạo branch từ main
git checkout -b feature/ten-branch-moi
```

### Bước 2: Commit các thay đổi của bạn

```bash
# Xem các file đã thay đổi
git status

# Thêm các file muốn commit
git add .

# Hoặc thêm từng file cụ thể
git add file1.js file2.js

# Commit với message mô tả
git commit -m "Mô tả những thay đổi bạn đã làm"
```

### Bước 3: Push branch lên GitHub

```bash
# Push branch mới lên GitHub
git push origin feature/ten-branch-moi

# Lần đầu push, có thể cần set upstream
git push -u origin feature/ten-branch-moi
```

### Bước 4: Tạo Pull Request trên GitHub

1. Vào repository trên GitHub: https://github.com/htung0403/vinfast-web
2. Bạn sẽ thấy thông báo "Compare & pull request" xuất hiện
3. Click vào nút "Compare & pull request"
4. Điền thông tin:
   - **Title**: Tiêu đề mô tả PR
   - **Description**: Mô tả chi tiết những thay đổi
5. Chọn người review (nếu cần)
6. Click "Create pull request"

---

## Cách 2: Tạo Pull Request từ Command Line (GitHub CLI)

Nếu bạn đã cài GitHub CLI:

```bash
# Cài GitHub CLI (nếu chưa có)
# Windows: winget install GitHub.cli

# Login vào GitHub
gh auth login

# Tạo Pull Request
gh pr create --title "Tiêu đề PR" --body "Mô tả PR"
```

---

## Cách 3: Tạo Pull Request từ GitHub Web Interface

1. Vào repository: https://github.com/htung0403/vinfast-web
2. Click tab "Pull requests"
3. Click nút "New pull request"
4. Chọn:
   - **base**: branch đích (thường là `main`)
   - **compare**: branch của bạn (ví dụ: `feature/ten-branch-moi`)
5. Điền thông tin và tạo PR

---

## Lưu ý quan trọng:

1. **Luôn tạo branch mới** thay vì commit trực tiếp vào `main`
2. **Viết commit message rõ ràng** để người khác hiểu thay đổi
3. **Pull request nên có mô tả đầy đủ** về những gì đã thay đổi
4. **Kiểm tra code trước khi tạo PR** để tránh lỗi

---

## Quy trình làm việc với Pull Request:

```bash
# 1. Cập nhật main branch
git checkout main
git pull origin main

# 2. Tạo branch mới
git checkout -b feature/ten-tinh-nang

# 3. Làm việc và commit
git add .
git commit -m "Thêm tính năng mới"

# 4. Push lên GitHub
git push -u origin feature/ten-tinh-nang

# 5. Tạo Pull Request trên GitHub web interface
```

---

## Xử lý khi có conflict:

Nếu có conflict khi merge PR:

```bash
# Cập nhật branch của bạn với main mới nhất
git checkout feature/ten-branch-moi
git pull origin main

# Giải quyết conflict trong code
# Sau đó commit
git add .
git commit -m "Resolve conflicts"

# Push lại
git push origin feature/ten-branch-moi
```

