# Git Commands

## 1. Kiểm tra trạng thái

```bash
git status
```

Hiển thị trạng thái file.

---

## 2. Xem branch

```bash
git branch
```

Xem branch local.

```bash
git branch -a
```

Xem tất cả branch.

```bash
git branch -r
```

Xem branch remote.

---

## 3. Chuyển branch

```bash
git switch main
```

Hoặc

```bash
git checkout main
```

---

## 4. Tạo branch mới

```bash
git switch -c feature/login
```

Hoặc

```bash
git checkout -b feature/login
```

---

## 5. Đồng bộ từ remote

```bash
git fetch
```

```bash
git pull
```

```bash
git pull origin main
```

---

## 6. Commit

```bash
git add .
```

```bash
git commit -m "Update feature"
```

---

## 7. Push

```bash
git push
```

Lần đầu:

```bash
git push -u origin feature/login
```

---

## 8. Clone

```bash
git clone <repository>
```

---

## 9. Xem lịch sử

```bash
git log
```

Ngắn gọn:

```bash
git log --oneline --graph --decorate --all
```

---

## 10. Xem thay đổi

```bash
git diff
```

```bash
git diff --cached
```

---

## 11. Undo

### Bỏ add

```bash
git restore --staged .
```

### Khôi phục file

```bash
git restore src/App.tsx
```

### Quay commit nhưng giữ code

```bash
git reset --soft HEAD~1
```

### Quay commit và bỏ code

```bash
git reset --hard HEAD~1
```

---

## 12. Stash

Lưu tạm:

```bash
git stash
```

Danh sách:

```bash
git stash list
```

Lấy lại:

```bash
git stash pop
```

---

## 13. Remote

Xem remote:

```bash
git remote -v
```

Đổi remote:

```bash
git remote set-url origin <repository>
```

Xóa remote:

```bash
git remote remove origin
```

Thêm remote:

```bash
git remote add origin <repository>
```

---

## 14. Tag

Tạo tag:

```bash
git tag v1.0.0
```

Push tag:

```bash
git push origin v1.0.0
```

Push toàn bộ tag:

```bash
git push origin --tags
```

---

## 15. Xóa branch

Local:

```bash
git branch -d feature/login
```

Force:

```bash
git branch -D feature/login
```

Remote:

```bash
git push origin --delete feature/login
```

---

## 16. Reset về remote

```bash
git fetch origin
git reset --hard origin/main
```

---

## 17. Force đồng bộ local

```bash
git fetch --all
git reset --hard origin/main
git clean -fd
```

---

## 18. Rebase

```bash
git pull --rebase
```

```bash
git rebase main
```

---

## 19. Merge

```bash
git merge feature/login
```

---

## 20. Cherry Pick

```bash
git cherry-pick <commit-id>
```

---

## 21. Revert

```bash
git revert <commit-id>
```

---

## 22. Xem commit

```bash
git show HEAD
```

```bash
git show <commit-id>
```

---

## 23. Tìm commit

```bash
git reflog
```

```bash
git reflog -10
```

---

## 24. Kiểm tra SHA

```bash
git rev-parse HEAD
```

```bash
git rev-parse origin/main
```

---

## 25. Clean project

Xóa file untracked:

```bash
git clean -fd
```

Xóa cả ignored files:

```bash
git clean -fdx
```

---

## 26. Force Push

```bash
git push --force-with-lease
```

Không khuyến khích:

```bash
git push --force
```

---

## 27. Submodule

Khởi tạo:

```bash
git submodule update --init --recursive
```

Cập nhật:

```bash
git submodule update --remote
```

---

## 28. Kiểm tra cấu hình

```bash
git config --list
```

Tên:

```bash
git config user.name
```

Email:

```bash
git config user.email
```

---

## 29. Alias hữu ích

```bash
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.cm commit
git config --global alias.lg "log --oneline --graph --decorate --all"
```

Sử dụng:

```bash
git st
git co main
git br
git lg
```

---

# Các lệnh thường dùng hằng ngày

```bash
git fetch
git status
git pull
git add .
git commit -m "message"
git push
```

---

# Khôi phục code từ remote

```bash
git fetch origin
git reset --hard origin/main
git clean -fd
```

---

# Giữ code local nhưng cập nhật remote

```bash
git remote set-url origin <new_repo>
git fetch
git push -u origin main
```

---

# Debug

```bash
git status
git remote -v
git branch -vv
git log --oneline --graph --decorate --all
git reflog
```