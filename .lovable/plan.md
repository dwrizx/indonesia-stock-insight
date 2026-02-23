

# Fitur Stock Screening & Perbaikan Navigasi IDX Saham

## Ringkasan
Menambahkan fitur **Stock Screening** baru yang terinspirasi dari referensi gambar, serta membuat logo "IDX Saham" bisa diklik untuk navigasi ke halaman utama, dan memperbaiki tampilan detail.

---

## 1. Tab Baru: Screening

Menambahkan tab **"Screening"** di navigasi utama dengan tampilan seperti referensi:

### Filter Bar (bagian atas)
- **Categories** dropdown: Semua, Blue Chip, High Dividend, Growth, Value
- **Filters & Range** panel (expandable): Date picker From/To, time period chips (1d, 1w, 1m, 3m, 6m, YTD, 365d)
- **Valuation** dropdown: All, Undervalued, Fair Value, Overvalued
- **Verdict** dropdown: All Verdicts, Strong Buy, Buy, Hold, Sell, Strong Sell
- **Sharia-compliant only** checkbox
- **Grid/List** view toggle
- **Reset** dan **Clear** buttons

### Available Tickers
- Chips ticker yang bisa diklik untuk toggle on/off (hijau = aktif, default = non-aktif)
- Counter "Available Tickers (N)"

### Stock Screening Cards (hasil)
Setiap kartu menampilkan:
- **Header**: Timestamp cache, Verdict badge (BUY/ACCUMULATE, HOLD, STRONG BUY) dengan warna
- **Info**: Ticker besar, nama perusahaan, last close price, % change
- **Recommendation section**: Label + momentum indicator
- **Signals**: chips 1W, 1M, 3M+ dengan warna hijau/merah/netral
- **Price Targets**: 3 kolom - Conservative, Moderate, Aggressive - masing-masing dengan harga target dan % upside
- **Key Indicators**: RSI (14), RSI (12), MACD value + icon, Vol Ratio

---

## 2. IDX Saham Clickable (Navigasi Home)

### Halaman Index (header)
- Bungkus logo + teks "IDX Saham" dengan `<Link to="/">` agar bisa diklik ke halaman depan

### Halaman StockDetail (header)
- Bungkus logo + teks "IDX Saham" dengan `<Link to="/">` - saat ini hanya teks biasa, bukan link

---

## 3. Perbaikan Halaman Detail

- Menambahkan **signal badge** (BUY/HOLD/SELL) di hero section halaman detail
- Menambahkan section **Price Targets** (Conservative, Moderate, Aggressive) seperti di screening cards
- Menambahkan **Key Indicators mini cards** (RSI, MACD, Vol Ratio) di sidebar

---

## Detail Teknis

### File Baru:
1. `src/components/StockScreener.tsx` - Komponen screening lengkap dengan filter bar, ticker chips, dan result cards

### File yang Dimodifikasi:
1. `src/pages/Index.tsx`
   - Tambah tab "Screening" di navigasi
   - Import dan render StockScreener
   - Bungkus logo header dengan Link
   - Tambah ScreeningSkeleton

2. `src/pages/StockDetail.tsx`
   - Bungkus logo "IDX Saham" dengan Link ke "/"
   - Tambah signal badge di hero
   - Tambah Price Targets section
   - Tambah Key Indicators cards (RSI, MACD, Vol Ratio) di sidebar

3. `src/components/TabSkeletons.tsx`
   - Tambah ScreeningSkeleton

### Tidak perlu package baru
- Semua menggunakan library yang sudah ada (framer-motion, lucide-react, recharts)
- Data dihitung dari stockData.ts yang sudah ada

