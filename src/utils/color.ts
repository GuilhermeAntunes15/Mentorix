function expandShortHex(hex: string) {
  return hex
    .split('')
    .map((digit) => `${digit}${digit}`)
    .join('');
}

function clampAlpha(alpha: number) {
  if (Number.isNaN(alpha)) {
    return 1;
  }

  return Math.max(0, Math.min(1, alpha));
}

export function hexToRgba(hex: string | undefined, alpha = 1) {
  if (!hex) {
    return `rgba(148, 163, 184, ${clampAlpha(alpha)})`;
  }

  const sanitized = hex.replace('#', '').trim();
  const normalized = sanitized.length === 3 ? expandShortHex(sanitized) : sanitized;

  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return `rgba(148, 163, 184, ${clampAlpha(alpha)})`;
  }

  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${clampAlpha(alpha)})`;
}
