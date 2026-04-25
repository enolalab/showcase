# 🤝 Hướng dẫn đóng góp — Enolalab Showcase

Cảm ơn bạn đã muốn showcase project của mình! Dưới đây là hướng dẫn từng bước.

## 📋 Yêu cầu

- Project phải là **static** (HTML/CSS/JS). Không hỗ trợ backend.
- Nếu dùng framework (React, Vue...) → **build ra static files** trước.
- Tổng dung lượng project **không quá 10MB**.
- Phải có file `index.html` ở root folder của project.

## 🚀 Các bước submit

### 1. Fork & Clone
```bash
git clone https://github.com/<your-username>/ropascis.git
cd ropascis
```

### 2. Tạo folder project
```bash
mkdir -p projects/my-awesome-project
```

### 3. Cập nhật `public/registry.json`
Thêm entry vào mảng `projects`. Xem trang **Hướng dẫn** trên website để biết schema chi tiết.

### 4. Tạo Pull Request
```bash
git checkout -b feat/add-my-awesome-project
git add . && git commit -m "feat: add my-awesome-project"
git push origin feat/add-my-awesome-project
```

## ✅ Checklist
- [ ] Folder nằm trong `projects/`
- [ ] Có `index.html`
- [ ] Đã thêm vào `registry.json`
- [ ] Dung lượng < 10MB
- [ ] Không chứa secrets

---
💜 **Cảm ơn bạn đã đóng góp!**
