// Browser-only: shrinks an image before it is uploaded from the admin panel.
// Uploaded images are stored in Firestore (lib/media.ts), where one document
// is limited to 1 MiB, so the result must stay below `maxBytes`.
// Certificates need their small print readable, so images are kept large
// (up to 2400 px) and at high quality; quality, then size, only go down as
// far as needed to fit.

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

const QUALITIES = [0.92, 0.88, 0.82];

export async function shrinkImage(file: File, maxSide = 2400, maxBytes = 850 * 1024): Promise<File> {
  if (file.type === "image/gif") return file; // keep animations as they are

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file; // a format the browser cannot decode: the server will reject it with a message

  let scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");

  for (let attempt = 0; attempt < 10; attempt++) {
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    const quality = QUALITIES[Math.min(attempt, QUALITIES.length - 1)];
    let blob = await toBlob(canvas, "image/webp", quality);
    // Safari cannot encode WebP and silently returns PNG — use JPEG there
    if (!blob || blob.type !== "image/webp") blob = await toBlob(canvas, "image/jpeg", quality);
    if (blob && blob.size <= maxBytes) {
      const ext = blob.type === "image/webp" ? "webp" : "jpg";
      return new File([blob], file.name.replace(/\.[^.]+$/, "") + "." + ext, { type: blob.type });
    }
    if (attempt >= QUALITIES.length - 1) scale *= 0.85; // still too big at the lowest quality: make it smaller
  }
  return file;
}
