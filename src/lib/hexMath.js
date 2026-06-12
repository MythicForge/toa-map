export const MAP_W = 2362;
export const MAP_H = 3168;

const SX = MAP_W / 4476;
const SY = MAP_H / 6000;

export const HEX_R = (57.514 * SX) / 1.5;

export function hexCenter(col, row) {
  const x = (194.172 + (col - 1) * 57.514) * SX;
  const y = (193.980 + (row - 1) * 66.756 + (col % 2 === 1 ? 33.545 : 0)) * SY;
  return [x, y];
}

export function hexPoints(cx, cy, r) {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i;
    return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
  }).join(' ');
}

export function hexId(col, row) {
  return String(col).padStart(2, '0') + String(row).padStart(2, '0');
}

export function colRowFromId(id) {
  return { col: parseInt(id.slice(0, 2)), row: parseInt(id.slice(2, 4)) };
}

export function pixelToHex(mapX, mapY) {
  const colF = (mapX / SX - 194.172) / 57.514 + 1;
  const col = Math.round(colF);
  let best = null, bestDist = Infinity;
  for (let dc = -2; dc <= 2; dc++) {
    const c = Math.max(1, Math.min(72, col + dc));
    const rowF = (mapY / SY - 193.980 - (c % 2 === 1 ? 33.545 : 0)) / 66.756 + 1;
    const r = Math.round(rowF);
    for (let dr = -1; dr <= 1; dr++) {
      const rv = Math.max(1, Math.min(85, r + dr));
      const center = hexCenter(c, rv);
      const dist = Math.hypot(mapX - center[0], mapY - center[1]);
      if (dist < bestDist) { bestDist = dist; best = { col: c, row: rv }; }
    }
  }
  return best;
}
