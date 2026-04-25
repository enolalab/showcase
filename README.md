# ◈ Enolalab Showcase

> **Nơi sinh viên Việt Nam biến ý tưởng thành sản phẩm thực tế.**

Nhiều bạn sinh viên có ý tưởng tuyệt vời về web, game, hay tool — nhưng không có domain, không biết deploy. **Enolalab Showcase** giải quyết điều đó: bạn chỉ cần submit project qua một **Pull Request trên GitHub**, chúng tôi lo phần còn lại.

🌐 **Live:** [enolalab.pages.dev](https://enolalab.pages.dev) *(coming soon)*

---

## ✨ Tính năng

- 🎨 **Showcase Gallery** — Hiển thị project với thumbnail, tags, tên tác giả
- 🔍 **Filter theo category** — Web, Game, Tool, AI, và nhiều hơn
- 📝 **Trang hướng dẫn** — Step-by-step guide để submit project
- 🚀 **Auto Deploy** — Merge PR → Cloudflare Pages tự động deploy
- 💯 **Miễn phí hoàn toàn** — Không cần domain, không cần hosting

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | TypeScript |
| Build | Vite |
| Styling | Vanilla CSS (Dark theme, Glassmorphism) |
| Hosting | Cloudflare Pages |
| CI/CD | GitHub Actions |

## 🚀 Chạy local

```bash
# Clone repo
git clone https://github.com/enolalab/showcase.git
cd ropascis

# Cài dependencies
npm install

# Chạy dev server
npm run dev
```

Dev server sẽ chạy tại `http://localhost:5173`.

## 📂 Cấu trúc project

```
ropascis/
├── src/
│   ├── main.ts              # Entry point
│   ├── types.ts             # TypeScript interfaces
│   ├── router.ts            # Hash-based SPA router
│   ├── data.ts              # Registry data loader
│   ├── utils.ts             # DOM utilities & animations
│   ├── styles/
│   │   └── index.css        # Design system & all styles
│   └── pages/
│       ├── home.ts          # Landing page + showcase gallery
│       └── guide.ts         # Hướng dẫn submit project
├── public/
│   └── registry.json        # Project registry (metadata)
├── projects/                # Thư mục chứa các project được submit
│   └── <project-name>/
│       └── index.html
├── .github/
│   └── PULL_REQUEST_TEMPLATE/
│       └── submit_project.md
├── CONTRIBUTING.md
├── index.html
├── tsconfig.json
└── package.json
```

## 🤝 Submit project của bạn

Chỉ cần **3 bước**:

### 1. Fork & Clone
```bash
git clone https://github.com/<your-username>/ropascis.git
```

### 2. Thêm project
- Tạo folder trong `projects/` (ví dụ: `projects/my-project/`)
- Đảm bảo có file `index.html` ở root folder
- Thêm entry vào `public/registry.json`

### 3. Tạo Pull Request
```bash
git checkout -b feat/add-my-project
git add . && git commit -m "feat: add my-project"
git push origin feat/add-my-project
```

> 📖 Xem chi tiết tại [CONTRIBUTING.md](CONTRIBUTING.md) hoặc trang **Hướng dẫn** trên website.

## 📋 Yêu cầu cho project

- ✅ **Static only** — HTML/CSS/JS (hoặc build output từ framework)
- ✅ Phải có `index.html` ở root
- ✅ Dung lượng tổng **< 10MB**
- ❌ Không chứa backend, API keys, hoặc nội dung vi phạm

## 📄 Registry Schema

Mỗi project trong `registry.json` có cấu trúc:

```jsonc
{
  "id": "my-project",           // kebab-case, unique
  "name": "My Project",         // Tên hiển thị
  "description": "Mô tả...",   // Tối đa 150 ký tự
  "author": {
    "name": "your-name",
    "github": "github-username",
    "avatar": "https://github.com/username.png"
  },
  "category": "web",            // web | game | tool | ai | other
  "tags": ["tag1", "tag2"],
  "thumbnail": null,            // hoặc path tới thumbnail
  "path": "projects/my-project",
  "liveUrl": null,
  "repoUrl": "https://github.com/...",
  "createdAt": "2026-04-25",
  "featured": false
}
```

## 📜 License

MIT © [k0walski](https://github.com/k0walski)

---

<p align="center">Made with 💜 for Vietnamese students</p>
