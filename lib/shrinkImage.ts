// Browser-only: shrinks an image before it is uploaded from the admin panel.
// Uploaded images are stored in Firestore (lib/media.ts), where one document
// is limited to 1 MiB, so the result must stay below `maxBytes`.

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

export async function shrinkImage(file: File, maxSide = 1200, maxBytes = 850 * 1024): Promise<File> {
  if (file.type === "image/gif") return file; // keep animations as they are

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file; // a format the browser cannot decode: the server will reject it with a message

  let scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");

  for (let attempt = 0; attempt < 6; attempt++) {
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    const quality = attempt < 3 ? [0.85, 0.75, 0.65][attempt] : 0.65;
    let blob = await toBlob(canvas, "image/webp", quality);
    // Safari cannot encode WebP and silently returns PNG — use JPEG there
    if (!blob || blob.type !== "image/webp") blob = await toBlob(canvas, "image/jpeg", quality);
    if (blob && blob.size <= maxBytes) {
      const ext = blob.type === "image/webp" ? "webp" : "jpg";
      return new File([blob], file.name.replace(/\.[^.]+$/, "") + "." + ext, { type: blob.type });
    }
    if (attempt >= 2) scale *= 0.8; // still too big at low quality: make it smaller
  }
  return file;
}
