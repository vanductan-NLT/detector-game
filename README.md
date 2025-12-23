<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🕵️ Tìm Gián Điệp - Remote Team Game

Game tìm gián điệp online hỗ trợ multi-player với Google Sheets làm database. Hoàn hảo cho team remote!

[![Deploy](https://img.shields.io/badge/Deploy-Vercel-black)](https://vercel.com)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)

## ✨ Tính Năng

- 🎮 **Multi-player Online**: Nhiều người chơi cùng lúc từ các thiết bị khác nhau
- ☁️ **Cloud Sync**: Dữ liệu tự động đồng bộ qua Google Sheets
- 🔄 **Real-time Updates**: Cập nhật mỗi 3 giây
- 📱 **Responsive Design**: Chơi được trên mọi thiết bị
- 🚀 **No Backend Needed**: Sử dụng Google Apps Script miễn phí
- 🎯 **3 Vai Trò**: Dân, Gián điệp, Mũ Trắng

## 🚀 Quick Start

### Chạy Local

**Prerequisites:** Node.js 18+

```bash
# 1. Cài dependencies
npm install

# 2. Chạy dev server
npm run dev

# 3. Mở browser
# → http://localhost:5173
```

### Setup Google Sheets (Khuyên dùng)

👉 **Xem hướng dẫn chi tiết**: [GOOGLE_SHEETS_SETUP.md](GOOGLE_SHEETS_SETUP.md)

**Cấu trúc mới - Đơn giản hơn**:
- 🎯 **Mỗi người chơi = 1 dòng** trong Sheet
- 📝 **5 cột plain text**: gameId, playerName, role, keyword, allKeywords
- ❌ **Không JSON** - Dễ đọc, dễ filter!

**Setup nhanh:**
1. Tạo Google Sheet với 5 cột (xem [GOOGLE_SHEET_STRUCTURE.md](GOOGLE_SHEET_STRUCTURE.md))
2. Tạo Google Apps Script (code trong [apps-script-code.js](apps-script-code.js))
3. **Setup .env file**:
   ```bash
   # Copy file mẫu
   cp .env.example .env
   
   # Mở .env và paste URL từ Google Apps Script
   # VITE_CLOUD_SYNC_URL=https://script.google.com/macros/s/.../exec
   ```
4. Done! URL sẽ tự động load khi tạo game 🎉

> **💡 Tip**: Nếu dùng `.env`, không cần paste URL mỗi lần tạo game nữa!

## 📦 Deploy

👉 **Xem hướng dẫn deploy**: [DEPLOY.md](DEPLOY.md)

**Nhanh nhất:**
```bash
# GitHub Pages
npm run deploy:ghpages

# Hoặc Vercel
vercel --prod
```

## 🎮 Cách Chơi

1. **Admin** tạo game tại `/admin`
2. **Share link** `/play/{gameId}` cho người chơi
3. Mỗi người **xem vai trò** và từ khóa riêng
4. **Thảo luận** và tìm ra gián điệp!

### Luật Chơi

- **Dân**: Biết từ khóa thật, tìm gián điệp
- **Gián điệp**: Biết từ khóa giả, phải đoán từ khóa thật
- **Mũ Trắng**: Không biết từ khóa nào, đoán cả hai

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 6
- **Routing**: React Router v7
- **Database**: Google Sheets + Apps Script
- **Styling**: Pure CSS (Tailwind-like utilities)

## 📊 Project Structure

```
detector-game/
├── components/
│   ├── AdminPanel.tsx      # Tạo và quản lý game
│   └── PlayerView.tsx      # Giao diện người chơi
├── App.tsx                 # Main app + routing
├── types.ts                # TypeScript definitions
├── GOOGLE_SHEETS_SETUP.md  # Hướng dẫn setup cloud
└── DEPLOY.md               # Hướng dẫn deploy
```

## 🔧 Scripts

```bash
npm run dev              # Chạy development server
npm run build            # Build production
npm run preview          # Preview production build
npm run deploy:ghpages   # Deploy lên GitHub Pages
```

## 💡 Tips

- **localStorage**: Game state được lưu local để backup
- **Cloud First**: Khi có Cloud URL, ưu tiên sync với Google Sheets
- **Resilient**: Nếu mất kết nối, vẫn chơi được với localStorage
- **Shareable**: Mỗi game có ID unique, dễ dàng share

## 🆘 Troubleshooting

### Game không sync?
- Kiểm tra Cloud URL đã đúng chưa
- Xem Console (F12) có lỗi không
- Check Google Apps Script logs

### Không deploy được?
- Chạy `npm run build` test trước
- Xem logs của platform (Vercel/Netlify)
- Đảm bảo `package.json` đúng version

## 📝 License

MIT License - Feel free to use!

## 🙏 Credits

Built with ❤️ for remote teams everywhere

---

**Happy Hunting! 🕵️‍♂️🔍**
