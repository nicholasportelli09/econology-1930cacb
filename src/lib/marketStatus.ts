// Lightweight US equity market status helper.
// Markets are closed on weekends (Sat/Sun in America/New_York). We do not
// account for holidays here — the Finnhub feed will simply return a stale
// last-close print on those days, but our UI labels it clearly as such.

export type MarketStatus = {
  isOpen: boolean;
  isWeekend: boolean;
  label: string; // short status label
  reason: string; // longer copy
};

export function getUSMarketStatus(now: Date = new Date()): MarketStatus {
  // Get weekday in America/New_York
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(now);
  const weekday = parts.find(p => p.type === "weekday")?.value ?? "";
  const hour = Number(parts.find(p => p.type === "hour")?.value ?? "0");
  const minute = Number(parts.find(p => p.type === "minute")?.value ?? "0");

  const isWeekend = weekday === "Sat" || weekday === "Sun";
  // Regular session: 09:30 – 16:00 ET, Mon–Fri.
  const minutesET = hour * 60 + minute;
  const inSession = minutesET >= 9 * 60 + 30 && minutesET < 16 * 60;
  const isOpen = !isWeekend && inSession;

  if (isWeekend) {
    return {
      isOpen: false,
      isWeekend: true,
      label: "Markets closed — weekend",
      reason: "US equity markets are closed on Saturday and Sunday. Prices shown reflect Friday's close.",
    };
  }
  if (!isOpen) {
    return {
      isOpen: false,
      isWeekend: false,
      label: "Markets closed",
      reason: "US regular session runs 9:30am–4:00pm ET. Prices shown reflect the most recent close.",
    };
  }
  return { isOpen: true, isWeekend: false, label: "Markets open", reason: "US regular session is live." };
}
