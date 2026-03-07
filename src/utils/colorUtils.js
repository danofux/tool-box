export function hexToRgb(hex) {
  const n = hex.replace('#', '');
  return {
    r: parseInt(n.slice(0, 2), 16),
    g: parseInt(n.slice(2, 4), 16),
    b: parseInt(n.slice(4, 6), 16),
  };
}

export function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const v = max, d = max - min;
  const s = max === 0 ? 0 : d / max;
  let h = 0;
  if (max !== min) {
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) };
}

export function rgbToCmyk(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const k = 1 - Math.max(r, g, b);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  return {
    c: Math.round(((1 - r - k) / (1 - k)) * 100),
    m: Math.round(((1 - g - k) / (1 - k)) * 100),
    y: Math.round(((1 - b - k) / (1 - k)) * 100),
    k: Math.round(k * 100),
  };
}

/* hsl (0-360, 0-100, 0-100) → "#rrggbb" */
export function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const k = (n + h / 30) % 12;
    const c = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * c).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function generatePalette(locked = []) {
  const h = Math.floor(Math.random() * 360);
  const s = 55 + Math.floor(Math.random() * 28);
  const strategies = [
    [h, (h + 18) % 360, (h + 36) % 360, (h - 18 + 360) % 360, (h - 36 + 360) % 360],
    [h, (h + 150) % 360, (h + 180) % 360, (h + 210) % 360, (h + 30) % 360],
    [h, (h + 120) % 360, (h + 240) % 360, (h + 60) % 360, (h + 300) % 360],
  ];
  const hues = strategies[Math.floor(Math.random() * strategies.length)];
  const lights = [35, 45, 55, 65, 74];
  return hues.map((hue, i) =>
    locked[i] ?? hslToHex(hue, s, lights[i])
  );
}

export function getColorFormats(hex) {
  const { r, g, b } = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(r, g, b);
  const { h: hv, s: sv, v } = rgbToHsv(r, g, b);
  const { c, m, y, k } = rgbToCmyk(r, g, b);
  return {
    HEX: hex.toUpperCase(),
    RGB: `rgb(${r}, ${g}, ${b})`,
    HSL: `hsl(${h}, ${s}%, ${l}%)`,
    HSV: `hsv(${hv}, ${sv}%, ${v}%)`,
    CMYK: `cmyk(${c}%, ${m}%, ${y}%, ${k}%)`,
  };
}

/* Perceived luminance — true when color needs dark text */
export function isLight(hex) {
  const { r, g, b } = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55;
}
