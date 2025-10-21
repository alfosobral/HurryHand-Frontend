export function buildDayOptions(xMinutes) {
  if (!xMinutes || xMinutes <= 0) return [];
  const startMin = 6 * 60;
  const endOfDay = 24 * 60;
  const opts = [];

  for (let start = startMin; start < endOfDay; start += 60) {
    const end = start + xMinutes;
    if (end <= endOfDay) {
      const sH = Math.floor(start / 60), sM = start % 60;
      const eH = Math.floor(end / 60), eM = end % 60;
      opts.push({ value: String(sH), label: `${fmt(sH)}:${fmt(sM)} – ${fmt(eH)}:${fmt(eM)}` });
    }
  }
  return opts;
}
const fmt = (n) => String(n).padStart(2, "0");
