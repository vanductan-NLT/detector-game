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

### 1. Cài Đặt

```bash
# Clone repo
git clone https://github.com/vanductan/detector-game.git
cd detector-game

# Cài dependencies
npm install

# Chạy dev server
npm run dev

# Mở browser → http://localhost:5173
```

### 2. Setup Google Sheets (Khuyên dùng)

#### Bước 1: Tạo Google Sheet
1. Vào [Google Sheets](https://sheets.google.com)
2. Tạo Sheet mới
3. Tạo header row với 6 cột:
   ```
   gameId | playerName | role | keyword | allKeywords | config
   ```

#### Bước 2: Tạo Apps Script
1. Trong Sheet: **Extensions** → **Apps Script**
2. Copy code từ file `apps-script-code.js`
3. Paste vào Apps Script Editor
4. **Save** (Ctrl+S)

#### Bước 3: Deploy Apps Script
1. Click **Deploy** → **New deployment**
2. Type: **Web app**
3. **Execute as**: Me
4. **Who has access**: Anyone
5. Click **Deploy**
6. **Copy URL** được tạo ra

#### Bước 4: Setup .env
```bash
# Copy file mẫu
cp .env.example .env

# Mở .env và paste URL vừa copy
# VITE_CLOUD_SYNC_URL=https://script.google.com/macros/s/.../exec
```

#### Bước 5: Test
- Reload browser
- Tạo game mới  
- Check Google Sheet → Có data chưa?

## 📦 Deploy Production

### Vercel (Khuyên dùng)
```bash
npm install -g vercel
vercel --prod
```

### GitHub Pages
```bash
npm run deploy:ghpages
```

### Netlify
```bash
npm run build
# Kéo thả folder 'dist' vào netlify.com/drop
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
- **Styling**: Pure CSS (Tailwind utilities)

## 📊 Cấu Trúc Google Sheet

### 6 Cột (Header Row):
```
gameId | playerName | role | keyword | allKeywords | config
```

### Ví Dụ Data:
| gameId | playerName | role | keyword | allKeywords | config |
|--------|------------|------|---------|-------------|--------|
| abc123 | __CONFIG__ |  |  | Táo / Cam | {"civilianKeyword":"Táo",...} |
| abc123 | Tân | Dân | Táo | Táo / Cam |  |
| abc123 | An | Gián điệp | Cam | Táo / Cam |  |

**Giải thích**:
- Row đầu tiên (playerName = `__CONFIG__`): Lưu config game
- Các rows sau: Mỗi row = 1 người chơi

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
- Check Google Apps Script logs (Executions tab)

### Không deploy được?
- Chạy `npm run build` test trước
- Xem logs của platform (Vercel/Netlify)
- Đảm bảo `package.json` đúng version

### Apps Script không hoạt động?
- Check deployment có **Anyone** access
- Xem Executions tab có lỗi không  
- Test URL với browser trước

## 📝 License

MIT License - Feel free to use!

## 🙏 Credits

Built with ❤️ for remote teams everywhere

---

**Happy Hunting! 🕵️‍♂️🔍**
