const clamp = (value: number, min = 0, max = 255) => {
  return Math.min(max, Math.max(min, value));
};

const padHex = (value: number) => value.toString(16).padStart(2, "0");

export const toHex = (r: number, g: number, b: number): string => {
  return `#${padHex(clamp(Math.round(r)))}${padHex(clamp(Math.round(g)))}${padHex(
    clamp(Math.round(b))
  )}`;
};

export const hexToRgb = (hex: string) => {
  const parsed = hex.replace("#", "");
  const bigint = parseInt(parsed, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
};

export const hexToRgba = (hex: string, alpha = 1) => {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const mixColor = (hex: string, amount: number) => {
  const { r, g, b } = hexToRgb(hex);
  const mix = (channel: number) =>
    clamp(channel + (amount >= 0 ? (255 - channel) * amount : channel * amount));
  return toHex(mix(r), mix(g), mix(b));
};

export const getReadableTextColor = (hex: string) => {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#1F2933" : "#F9FAFB";
};

export const extractPaletteFromImage = async (
  image: HTMLImageElement,
  colorCount = 5
): Promise<string[]> => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    return ["#0F172A", "#224870", "#F4F6FB", "#FEB144", "#FC6255"].slice(
      0,
      colorCount
    );
  }

  const targetWidth = 220;
  const ratio = image.naturalWidth / image.naturalHeight;
  canvas.width = targetWidth;
  canvas.height = Math.round(targetWidth / ratio);

  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const { data } = context.getImageData(0, 0, canvas.width, canvas.height);

  const colorBuckets = new Map<string, { count: number; r: number; g: number; b: number }>();
  const sampleStep = 4 * 6; // take every 6th pixel

  for (let index = 0; index < data.length; index += sampleStep) {
    const r = data[index];
    const g = data[index + 1];
    const b = data[index + 2];
    const key = `${Math.round(r / 32)}-${Math.round(g / 32)}-${Math.round(b / 32)}`;

    const bucket = colorBuckets.get(key);
    if (bucket) {
      bucket.count += 1;
      bucket.r += r;
      bucket.g += g;
      bucket.b += b;
    } else {
      colorBuckets.set(key, { count: 1, r, g, b });
    }
  }

  const sortedBuckets = Array.from(colorBuckets.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, colorCount);

  const palette = sortedBuckets.map((bucket) =>
    toHex(bucket.r / bucket.count, bucket.g / bucket.count, bucket.b / bucket.count)
  );

  if (palette.length === 0) {
    return ["#0F172A", "#224870", "#F4F6FB", "#FEB144", "#FC6255"].slice(
      0,
      colorCount
    );
  }

  return palette;
};
