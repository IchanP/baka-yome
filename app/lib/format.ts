// Display formatters + small date helpers.

export function ymd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function fmtNum(n: number): string {
  return n.toLocaleString("en-US");
}

export function fmtChars(n: number): string {
  if (n >= 1_000_000) {return (n / 1_000_000).toFixed(2) + "M";}
  if (n >= 10_000) {return (n / 1_000).toFixed(1) + "k";}
  return fmtNum(n);
}

export function fmtMinutes(m: number): string {
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h === 0) {return `${r}m`;}
  return `${h}h ${r}m`;
}

export function fmtHours(m: number): string {
  const h = m / 60;
  if (h >= 100) {return Math.round(h).toLocaleString("en-US");}
  if (h >= 10) {return h.toFixed(0);}
  return h.toFixed(1);
}

export const MONTHS_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
