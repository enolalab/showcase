# 🤝 Hướng dẫn đóng góp — Enolalab Showcase

Cảm ơn bạn đã muốn showcase project của mình! Dưới đây là hướng dẫn từng bước.

## 📋 Yêu cầu

- Project phải là **static** (HTML/CSS/JS). Không hỗ trợ backend.
- Phải có file `index.html` ở root folder của project.
- Tổng dung lượng project **không quá 10MB**.
- Không chứa code độc hại, API keys, secrets.

## 🛠️ Bạn có thể dùng bất kỳ công nghệ nào!

| Công nghệ | Hỗ trợ | Lưu ý |
|-----------|--------|-------|
| HTML/CSS/JS thuần | ✅ | Submit trực tiếp |
| TypeScript | ✅ | Compile ra `.js` trước khi submit |
| React / Vue / Svelte / Angular | ✅ | Build ra static files (`npm run build`) |
| Vite / Webpack / Rollup | ✅ | Submit output từ `dist/` hoặc `build/` |
| Tailwind / Sass / Less | ✅ | Compile ra `.css` trước khi submit |
| Next.js / Nuxt (SSG mode) | ✅ | Chỉ chấp nhận static export |
| Backend (Node, Python, PHP...) | ❌ | Không hỗ trợ server-side |
| Database | ❌ | Chỉ static, không có DB |

> **Quy tắc chung:** Bạn dev bằng gì cũng được, nhưng **chỉ submit file đã build** (HTML/CSS/JS) vào folder `projects/`. Hệ thống không chạy `npm install` hay `npm run build` cho project con.

### Ví dụ workflow với React + TypeScript:

```bash
# Trong repo project riêng của bạn
npx create-vite my-app --template react-ts
cd my-app
npm install && npm run build

# Copy build output vào showcase
cp -r dist/ /path/to/showcase/projects/my-app/
```

## 🚀 Các bước submit

### 1. Fork & Clone
```bash
git clone https://github.com/<your-username>/showcase.git
cd showcase
```

### 2. Tạo folder project
```bash
# Nếu HTML/CSS/JS thuần → tạo trực tiếp
mkdir -p projects/my-awesome-project

# Nếu dùng framework → copy build output
cp -r /path/to/your-project/dist/ projects/my-awesome-project/
```

### 3. Kiểm tra cấu trúc
```
projects/my-awesome-project/
├── index.html          ← BẮT BUỘC
├── style.css
├── script.js
└── assets/             ← (tùy chọn)
    ├── images/
    └── fonts/
```

### 4. Cập nhật `public/registry.json`
Thêm entry vào mảng `projects`:
```jsonc
{
  "id": "my-awesome-project",     // kebab-case, unique
  "name": "My Awesome Project",
  "description": "Mô tả ngắn gọn...",
  "author": {
    "name": "your-name",
    "github": "github-username",
    "avatar": "https://github.com/username.png"
  },
  "category": "web",              // web | game | tool | ai | other
  "tags": ["tag1", "tag2"],
  "thumbnail": null,
  "path": "projects/my-awesome-project",
  "liveUrl": null,
  "repoUrl": "https://github.com/your-username/your-repo",
  "createdAt": "2026-04-25",
  "featured": false
}
```

### 5. Tạo Pull Request
```bash
git checkout -b feat/add-my-awesome-project
git add . && git commit -m "feat: add my-awesome-project"
git push origin feat/add-my-awesome-project
```

Sau đó vào GitHub tạo Pull Request, sử dụng template có sẵn.

## ✅ Checklist
- [ ] Folder nằm trong `projects/`
- [ ] Có `index.html` ở root
- [ ] Đã thêm vào `registry.json`
- [ ] Dung lượng < 10MB
- [ ] Không chứa API keys, secrets
- [ ] **Chỉ chứa file đã build** (không có `node_modules/`, `src/`, `package.json`)
- [ ] Project chạy được khi mở `index.html` trực tiếp

---
💜 **Cảm ơn bạn đã đóng góp!**
