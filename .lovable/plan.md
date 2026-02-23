
# Peningkatan Visual & UX - IDX Saham Platform

## Ringkasan
Menyempurnakan tampilan keseluruhan platform agar lebih profesional, modern, dan polished. Fokus pada micro-interactions, visual hierarchy, typography refinement, dan komponen baru yang membuat dashboard terasa premium seperti Bloomberg Terminal atau TradingView.

## Package Baru yang Diperlukan

| Package | Fungsi |
|---------|--------|
| `@radix-ui/react-separator` | Sudah terinstall - visual divider |
| `lucide-react` | Sudah terinstall - ikon tambahan |
| `framer-motion` | Sudah terinstall - animasi lanjutan |

Tidak ada package baru yang perlu ditambahkan - semua yang diperlukan sudah tersedia.

## Perubahan yang Akan Dilakukan

### 1. Hero Section - Redesign Premium
- Tambahkan animasi angka "counting up" pada IHSG value menggunakan framer-motion
- Tambahkan mini stat cards (Volume Total, Market Cap Total, Jumlah Saham Aktif) di bawah badge Naik/Turun
- Gradient background yang lebih halus dengan animasi subtle shimmer

### 2. Market Overview Cards - Polish
- Tambahkan hover effect 3D tilt ringan (CSS transform perspective)
- Perbesar sparkline area agar lebih menonjol
- Tambahkan mini progress bar yang menunjukkan posisi harga relatif terhadap range hari ini
- Border glow animation saat hover

### 3. Tab Navigation - Upgrade
- Tambahkan animated underline/indicator yang bergerak smooth antar tab (sliding pill effect)
- Badge notification count pada tab "Saham" menunjukkan jumlah saham
- Icon animation saat tab aktif (subtle bounce)

### 4. Stock Cards - Visual Enhancement
- Tambahkan color-coded left border berdasarkan performa (hijau/merah gradient)
- Tambahkan rank badge (#1, #2, dst) pada grid view
- Hover state: card sedikit terangkat (translateY) dengan shadow yang lebih dramatis
- Tambahkan mini bar chart untuk volume comparison di bawah metrics

### 5. Top Movers - Improved Layout
- Tambahkan alternating row background untuk readability
- Rank numbers dengan styled badge (1st = gold, 2nd = silver, 3rd = bronze)
- Animated entry: staggered list animation saat tab dibuka
- Persentase change dengan filled background pill yang lebih prominent

### 6. Sector Chart - Better Visualization
- Tambahkan interactive hover tooltip yang lebih detail
- Color coding yang lebih kontras antar sektor

### 7. Global UI Polish (index.css)
- Tambahkan CSS custom property untuk smooth transition antar tema
- Tambahkan subtle backdrop blur pada semua card components
- Improve scrollbar styling
- Tambahkan focus-visible styles yang lebih jelas untuk accessibility
- Glass morphism effect yang lebih refined

### 8. StockDetail Page - Premium Feel
- Tambahkan breadcrumb navigation (Dashboard > BBCA)
- Price display dengan animated counter
- Metric cards dengan subtle gradient backgrounds berdasarkan nilai (hijau jika positif)
- Improved tab switching dengan sliding animation

### 9. Footer Section (Baru)
- Tambahkan footer dengan disclaimer, links, dan branding
- Informasi "Data terakhir diperbarui" timestamp
- Social/info links

## Detail Teknis

### File yang akan dimodifikasi:
1. `src/index.css` - Tambah utility classes baru, improve transitions, glass effects
2. `src/pages/Index.tsx` - Hero redesign, tab animation, footer, stat cards
3. `src/components/MarketOverview.tsx` - 3D hover, progress bar, enhanced sparklines
4. `src/components/StockCard.tsx` - Color border, rank badge, better hover states
5. `src/components/TopMovers.tsx` - Ranked list, alternating rows, staggered animation
6. `src/components/SectorChart.tsx` - Better tooltips, colors
7. `src/pages/StockDetail.tsx` - Breadcrumb, animated price, gradient metric cards

### File baru:
1. `src/components/AnimatedCounter.tsx` - Reusable angka yang beranimasi naik/turun
2. `src/components/Footer.tsx` - Footer component

### Pendekatan:
- Menggunakan framer-motion yang sudah terinstall untuk semua animasi
- CSS custom properties untuk transisi tema yang smooth
- Tailwind utilities untuk konsistensi styling
- Tidak menambahkan dependency baru untuk menjaga bundle size tetap kecil
