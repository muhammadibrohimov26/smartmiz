// Browser-only: hides parts of an image (passport number, QR code...) so they
// cannot be recovered. A light blur can sometimes be undone, so each area is
// first shrunk to a few pixels (the details are gone), then scaled back up
// and blurred so it looks soft rather than blocky.

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function redactArea(ctx: CanvasRenderingContext2D, source: CanvasImageSource, r: Rect) {
  const x = Math.max(0, Math.round(r.x));
  const y = Math.max(0, Math.round(r.y));
  const w = Math.round(r.w);
  const h = Math.round(r.h);
  if (w < 2 || h < 2) return;

  // One sample per block of at least 14 px (larger for big areas, so even a
  // QR code's corner squares vanish): text and QR modules are far smaller
  const block = Math.max(14, Math.min(w, h) / 4);
  const tiny = document.createElement("canvas");
  tiny.width = Math.max(1, Math.round(w / block));
  tiny.height = Math.max(1, Math.round(h / block));
  const t = tiny.getContext("2d")!;
  t.imageSmoothingEnabled = true;
  t.drawImage(source, x, y, w, h, 0, 0, tiny.width, tiny.height);

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.imageSmoothingEnabled = true;
  // First an opaque layer that fully covers the original...
  ctx.drawImage(tiny, 0, 0, tiny.width, tiny.height, x, y, w, h);
  // ...then the same blurred on top. A blurred image fades out at its edges,
  // so on its own it would let the original show through there.
  const radius = Math.max(4, Math.round(Math.min(w, h) / 6));
  const pad = radius * 2;
  ctx.filter = `blur(${radius}px)`;
  ctx.drawImage(tiny, 0, 0, tiny.width, tiny.height, x - pad, y - pad, w + pad * 2, h + pad * 2);
  ctx.restore();
}

// The image with all areas hidden, at full size
export function renderRedacted(img: HTMLImageElement, rects: Rect[]) {
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  // Every area is taken from the original, so overlapping areas stay hidden too
  const original = document.createElement("canvas");
  original.width = canvas.width;
  original.height = canvas.height;
  original.getContext("2d")!.drawImage(img, 0, 0);
  for (const r of rects) redactArea(ctx, original, r);
  return canvas;
}
