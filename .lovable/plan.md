
# Peningkatan Besar IDX Saham - Fitur Baru & Perbaikan Tampilan

## Ringkasan

Berdasarkan analisis mendalam terhadap semua tab dan komponen yang ada, berikut adalah ide fitur baru dan perbaikan visual yang akan membuat platform jauh lebih profesional dan fungsional.

---

## A. Fitur Baru

### 1. Watchlist / Saham Favorit (Tab Baru atau Widget)
- Pengguna bisa menandai saham sebagai favorit dengan klik ikon bintang
- Data disimpan di localStorage
- Widget ringkasan watchlist ditampilkan di tab Ringkasan
- Notifikasi visual jika saham di watchlist bergerak signifikan (lebih dari 2%)

### 2. Stock Screener (Tab Baru)
- Filter saham berdasarkan kriteria fundamental: P/E range, ROE minimum, Dividend Yield minimum, Market Cap range, Beta range
- Preset filter cepat: "Value Stocks", "Growth Stocks", "High Dividend", "Low Risk"
- Hasil ditampilkan dalam tabel yang bisa di-sort
- Jumlah saham yang memenuhi kriteria ditampilkan secara real-time

### 3. Market Sentiment Indicator (di Tab Ringkasan)
- Gauge/meter besar yang menunjukkan sentimen pasar: "Fear" vs "Greed"
- Dihitung dari rasio saham naik/turun, volume, dan volatilitas
- Visual seperti speedometer dengan warna gradasi merah-kuning-hijau

### 4. Mini Portfolio Simulator (di Tab Ringkasan atau Baru)
- Input: pilih saham, jumlah lot, harga beli
- Output: estimasi profit/loss saat ini, persentase return
- Simpan di localStorage
- Total portfolio value dan return ditampilkan

---

## B. Perbaikan Per Tab

### Tab Ringkasan (Overview)
**Saat ini**: MarketOverview cards + TopMovers + SectorChart
**Perbaikan**:
- Tambahkan Market Sentiment gauge di bagian atas
- Tambahkan section "Market Summary" berupa 1-2 kalimat auto-generated tentang kondisi pasar hari ini (contoh: "Pasar menguat hari ini dengan 9 dari 14 saham ditutup hijau. Sektor Teknologi memimpin kenaikan.")
- Tambahkan "Saham Paling Aktif" (berdasarkan volume) sebagai section ketiga di samping Top Gainers/Losers
- MarketOverview cards: tambahkan sparkline yang lebih besar dan klik untuk navigasi ke detail indeks
- TopMovers: tampilkan harga di samping persentase, dan tambahkan kolom volume

### Tab Saham (Stocks)
**Saat ini**: Grid/Table view dengan filter sektor dan sort
**Perbaikan**:
- Tambahkan search bar khusus di atas filter (saat ini search hanya di header)
- StockCard: tambahkan badge sinyal (BUY/HOLD/SELL) kecil di pojok berdasarkan fundamental score
- StockTable: tambahkan sticky header agar header tabel tetap terlihat saat scroll
- Tambahkan pagination atau "Load More" jika jumlah saham bertambah
- Tambahkan quick-filter chips: "Blue Chip", "High Dividend", "Small Cap", "Teknologi"

### Tab Peta Pasar (Heatmap)
**Saat ini**: Grid sederhana dengan warna berdasarkan perubahan harga
**Perbaikan**:
- Tambahkan tooltip detail saat hover: nama saham, harga, volume, market cap
- Tambahkan toggle view: berdasarkan "Perubahan Harga" vs "Volume" vs "Market Cap"
- Tambahkan legenda warna (color scale bar) di atas heatmap
- Grouping berdasarkan sektor dengan label sektor yang jelas
- Ukuran kotak lebih proporsional terhadap market cap (treemap style yang lebih baik)
- Klik pada kotak navigasi ke halaman detail saham

### Tab Bandingkan (Compare)
**Saat ini**: Sudah cukup lengkap dengan chart, fundamental, teknikal, dan analyst ratings
**Perbaikan**:
- Tambahkan fitur "Compare 3 Saham" (saat ini hanya 2)
- Tambahkan radar chart untuk visualisasi perbandingan multi-dimensi (Valuasi, Profitabilitas, Dividen, Momentum, Risiko)
- Tambahkan section "Verdict / Kesimpulan" berupa ringkasan auto-generated siapa yang lebih baik dan mengapa
- Tambahkan share/export button untuk screenshot perbandingan
- Scroll-to-section navigation di samping kiri

### Tab Sektor
**Saat ini**: Hanya pie chart dengan daftar sektor
**Perbaikan**:
- Tambahkan detail per sektor saat diklik: daftar saham dalam sektor itu, rata-rata P/E sektor, rata-rata perubahan harga
- Tambahkan bar chart horizontal untuk perbandingan performa sektor (hari ini)
- Tambahkan tabel ringkasan sektor: nama, jumlah saham, avg change%, avg P/E, avg dividend yield
- Klik pada sektor membuka expanded view dengan saham-saham di dalamnya

---

## C. Perbaikan Tampilan Global

### Header & Navigation
- Tambahkan notifikasi badge pada tab jika ada saham yang bergerak lebih dari 3%
- Mobile search: tampilkan search bar di halaman utama untuk mobile (saat ini hanya di desktop header)

### Heatmap - Redesign Total
- Gunakan layout treemap yang lebih akurat dengan ukuran kotak proporsional ke market cap
- Tambahkan animasi transisi saat data berubah
- Color legend bar di bagian atas

### Stock Detail Page
- Tambahkan tab "Berita" dan "Peer Comparison" ke dalam tab selector (saat ini terpisah di bawah)
- Tambahkan ringkasan 1 kalimat di bawah nama saham tentang kondisi saham

---

## D. Detail Teknis

### File Baru:
1. `src/components/MarketSentiment.tsx` - Gauge sentimen pasar (Fear/Greed meter)
2. `src/components/MarketSummary.tsx` - Ringkasan pasar auto-generated
3. `src/components/MostActive.tsx` - Saham paling aktif berdasarkan volume
4. `src/components/HeatMapLegend.tsx` - Color scale legend untuk heatmap
5. `src/components/SectorDetail.tsx` - Detail expanded per sektor
6. `src/components/RadarCompare.tsx` - Radar chart untuk perbandingan multi-dimensi

### File yang Dimodifikasi:
1. `src/pages/Index.tsx` - Integrasi komponen baru di setiap tab, mobile search
2. `src/components/HeatMap.tsx` - Redesign dengan tooltip, toggle view, legenda, grouping sektor, navigasi klik
3. `src/components/SectorChart.tsx` - Tambahkan bar chart performa, tabel ringkasan, klik-to-expand
4. `src/components/StockCompare.tsx` - Radar chart, verdict section
5. `src/components/StockCard.tsx` - Badge sinyal BUY/HOLD/SELL
6. `src/components/StockTable.tsx` - Sticky header, tambah kolom
7. `src/components/TopMovers.tsx` - Tambahkan kolom harga dan volume, section "Most Active"
8. `src/components/MarketOverview.tsx` - Klik navigasi, sparkline lebih besar

### Pendekatan:
- Semua menggunakan library yang sudah terinstall (framer-motion, recharts, lucide-react)
- Tidak perlu package baru
- Data menggunakan stockData.ts yang sudah ada dengan kalkulasi tambahan
- localStorage untuk fitur Watchlist dan Portfolio
