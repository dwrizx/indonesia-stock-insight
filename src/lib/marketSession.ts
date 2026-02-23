function getJakartaDate(now: Date): Date {
  const wib = now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" });
  return new Date(wib);
}

export function getMarketSession(now: Date = new Date()): {
  isOpen: boolean;
  label: string;
  shortLabel: string;
} {
  const wib = getJakartaDate(now);
  const day = wib.getDay(); // 0 Sun, 6 Sat
  const minutes = wib.getHours() * 60 + wib.getMinutes();
  const openMinutes = 9 * 60;
  const closeMinutes = 16 * 60 + 15;
  const isWeekday = day >= 1 && day <= 5;
  const isOpen = isWeekday && minutes >= openMinutes && minutes <= closeMinutes;

  return {
    isOpen,
    label: isOpen ? "Pasar Buka (WIB)" : "Pasar Tutup (WIB)",
    shortLabel: isOpen ? "Buka" : "Tutup",
  };
}
