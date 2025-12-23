# 🕵️ Tìm Gián Điệp - Remote Team Game

Game tìm gián điệp online hỗ trợ multi-player với Google Sheets làm database. Hoàn hảo cho team remote!

## 🎮 Cách Chơi

1. **Admin** tạo game tại `/admin`
2. **Share link** `/play/{gameId}` cho người chơi
3. Mỗi người **xem vai trò** và từ khóa riêng
4. **Thảo luận** và tìm ra gián điệp!

### Luật Chơi
- **Dân**: Biết từ khóa thật, tìm gián điệp
- **Gián điệp**: Biết từ khóa giả, phải đoán từ khóa thật
- **Mũ Trắng**: Không biết từ khóa nào, đoán cả hai

## 🚀 Setup & Run

```bash
# Cài đặt
npm install

# Setup Env
cp .env.example .env
# -> Paste Google Apps Script URL vào .env

# Chạy Local
npm run dev
# -> http://localhost:5173
```

## 📊 Cấu Trúc Google Sheet

Yêu cầu 2 Sheets: **Games** và **Players**

### Sheet 1: Games
Header: `gameId` | `status` | `config` | `createdAt`
*Quản lý trạng thái và cấu hình game.*

### Sheet 2: Players
Header: `gameId` | `playerName` | `role` | `keyword` | `joinedAt`
*Lưu danh sách người chơi.*

## 🔧 Google Apps Script

1. Vào Sheet -> Extensions -> Apps Script
2. Copy code từ `apps-script-code.js`
3. Deploy Web App -> Access: **Anyone**
4. Lấy URL paste vào `.env`

## 📂 Project Structure

```
detector-game/
├── components/
│   ├── AdminPanel.tsx      # Quản lý game (Admin UI)
│   └── PlayerView.tsx      # Giao diện người chơi
├── App.tsx                 # Main Logic & Routing
├── types.ts                # TypeScript Types
└── apps-script-code.js     # Backend Code (Google Apps Script)
```

## 📜 Scripts

```bash
npm run dev              # Chạy development server
npm run build            # Build production (html/css/js)
npm run preview          # Preview bản build
```
