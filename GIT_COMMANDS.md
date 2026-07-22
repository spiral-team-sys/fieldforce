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

git status
git branch -vv
git log --oneline -5
git log origin/main..HEAD --oneline
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

# Git Branch Recovery Guide

## 1. Kiểm tra tình trạng hiện tại

```bash
git status
git branch -vv
git remote -v
git log --oneline --graph --decorate --all
git reflog -20
```

---

## 2. Tôi đang đứng ở branch nào?

```bash
git branch --show-current
```

---

## 3. Branch local đang theo dõi branch remote nào?

```bash
git branch -vv
```

Ví dụ:

```
* develop 1234567 [origin/develop]
```

---

## 4. Đồng bộ danh sách branch

```bash
git fetch --all --prune
```

---

## 5. Chuyển branch

```bash
git switch main
```

hoặc

```bash
git switch feature/login
```

---

## 6. Tạo branch mới từ branch hiện tại

```bash
git switch -c feature/new
```

---

## 7. Branch local bị lệch remote

Xem khác nhau

```bash
git log HEAD..origin/main
```

```bash
git log origin/main..HEAD
```

Đồng bộ

```bash
git fetch origin
git reset --hard origin/main
```

---

## 8. Muốn bỏ toàn bộ code local

```bash
git fetch
git reset --hard origin/main
git clean -fd
```

---

## 9. Muốn giữ code local nhưng cập nhật remote

```bash
git fetch
git rebase origin/main
```

hoặc

```bash
git pull --rebase
```

---

## 10. Lỡ commit sai branch

Ví dụ commit trên main.

Lấy commit

```bash
git log --oneline
```

Tạo branch

```bash
git switch -c feature/login
```

Quay main

```bash
git switch main
git reset --hard origin/main
```

---

## 11. Muốn chuyển commit sang branch khác

```bash
git cherry-pick <commit-id>
```

---

## 12. Muốn bỏ commit cuối

Giữ code

```bash
git reset --soft HEAD~1
```

Bỏ luôn code

```bash
git reset --hard HEAD~1
```

---

## 13. Lỡ reset hoặc checkout mất code

```bash
git reflog
```

Ví dụ

```
abc123 HEAD@{3}
```

Khôi phục

```bash
git reset --hard abc123
```

---

## 14. Branch local khác hoàn toàn remote

```bash
git fetch
git checkout main
git reset --hard origin/main
```

---

## 15. Đổi remote sang repository khác

Xem

```bash
git remote -v
```

Đổi

```bash
git remote set-url origin <new_repo>
```

---

## 16. Xóa branch local

```bash
git branch -D feature/login
```

---

## 17. Xóa branch remote

```bash
git push origin --delete feature/login
```

---

## 18. Tạo branch từ remote

```bash
git switch -c develop origin/develop
```

---

## 19. Branch bị detached HEAD

Kiểm tra

```bash
git status
```

Nếu hiện

```
HEAD detached
```

Tạo branch

```bash
git switch -c recover
```

---

## 20. Muốn lấy lại branch đã xóa

```bash
git reflog
```

Tìm commit cuối

```
abc123
```

Khôi phục

```bash
git branch feature/login abc123
```

---

# Checklist khi bị rối branch

```bash
git status

git branch -vv

git remote -v

git log --oneline --graph --decorate --all

git reflog -20
```

> Không chạy `git reset --hard` hoặc `git clean -fd` trước khi kiểm tra các lệnh trên.

---

# Quy trình xử lý an toàn

Bước 1

```bash
git status
```

↓

Bước 2

```bash
git branch -vv
```

↓

Bước 3

```bash
git log --oneline --graph --decorate --all
```

↓

Bước 4

```bash
git reflog
```

↓

Sau khi biết chính xác tình trạng mới quyết định:

- reset
- rebase
- merge
- cherry-pick
- stash

Tuyệt đối không đoán.