// Copper -> "1,234g 05s 00c" (1g = 100s, 1s = 100c).
export const formatGold = (copper: number) => {
  const g = Math.floor(copper / 10000);
  const s = Math.floor((copper % 10000) / 100);
  const c = copper % 100;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${g.toLocaleString()}g ${pad(s)}s ${pad(c)}c`;
};

export const formatRange = (min: number, max?: number) =>
  max === undefined || max === min
    ? min.toLocaleString()
    : `${min.toLocaleString()} ~ ${max.toLocaleString()}`;
