"use client";

import { PointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, Undo2 } from "lucide-react";
import { Rect, renderRedacted } from "@/lib/redact";
import { shrinkImage } from "@/lib/shrinkImage";

// Full-screen editor: the admin drags boxes over the passport number, QR code
// or anything private; on save those areas are hidden for good (lib/redact.ts)
// and the edited image replaces the one in the form.
export default function Redactor({ src, onDone, onCancel }: { src: string; onDone: (file: File) => void; onCancel: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [error, setError] = useState("");
  const [rects, setRects] = useState<Rect[]>([]);
  const [draft, setDraft] = useState<Rect | null>(null);
  const [saving, setSaving] = useState(false);
  const start = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const image = new Image();
    image.onload = () => setImg(image);
    image.onerror = () => setError("Rasmni ochib boʻlmadi");
    image.src = src;
  }, [src]);

  useEffect(() => {
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [onCancel]);

  // The image with the hidden areas applied; recomputed only when they change
  const preview = useMemo(() => {
    if (!img) return null;
    try {
      const canvas = renderRedacted(img, rects);
      canvas.getContext("2d")!.getImageData(0, 0, 1, 1); // throws if the image is from another site
      return canvas;
    } catch {
      return "tainted" as const;
    }
  }, [img, rects]);

  useEffect(() => {
    if (preview === "tainted") setError("Bu rasmni tahrirlab boʻlmaydi — faylni qaytadan yuklang");
  }, [preview]);

  // Preview plus outlines of the areas and of the box being drawn
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !img || !preview || preview === "tainted") return;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(preview, 0, 0);
    const line = Math.max(2, Math.round(img.naturalWidth / 300));
    ctx.lineWidth = line;
    ctx.setLineDash([line * 3, line * 2]);
    ctx.strokeStyle = "#FFB800";
    for (const r of rects) ctx.strokeRect(r.x, r.y, r.w, r.h);
    if (draft) {
      ctx.fillStyle = "rgba(255,184,0,0.25)";
      ctx.fillRect(draft.x, draft.y, draft.w, draft.h);
      ctx.strokeRect(draft.x, draft.y, draft.w, draft.h);
    }
  }, [img, preview, rects, draft]);

  function point(e: PointerEvent<HTMLCanvasElement>) {
    const canvas = e.currentTarget;
    const box = canvas.getBoundingClientRect();
    return {
      x: Math.min(canvas.width, Math.max(0, ((e.clientX - box.left) / box.width) * canvas.width)),
      y: Math.min(canvas.height, Math.max(0, ((e.clientY - box.top) / box.height) * canvas.height)),
    };
  }

  const toRect = (a: { x: number; y: number }, b: { x: number; y: number }): Rect => ({
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    w: Math.abs(a.x - b.x),
    h: Math.abs(a.y - b.y),
  });

  function onDown(e: PointerEvent<HTMLCanvasElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = point(e);
  }
  function onMove(e: PointerEvent<HTMLCanvasElement>) {
    if (start.current) setDraft(toRect(start.current, point(e)));
  }
  function onUp(e: PointerEvent<HTMLCanvasElement>) {
    if (!start.current) return;
    const r = toRect(start.current, point(e));
    start.current = null;
    setDraft(null);
    if (r.w >= 8 && r.h >= 8) setRects((list) => [...list, r]);
  }

  async function save() {
    if (!img) return;
    setSaving(true);
    try {
      const canvas = renderRedacted(img, rects);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.9));
      if (!blob) throw new Error();
      const type = blob.type === "image/webp" ? "image/webp" : "image/png"; // Safari has no WebP encoder
      // Shrunk like any upload (the stored copy must fit Firestore)
      onDone(await shrinkImage(new File([blob], `sertifikat.${type === "image/webp" ? "webp" : "png"}`, { type })));
    } catch {
      setError("Saqlab boʻlmadi");
      setSaving(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[200] bg-zinc-950 flex flex-col">
      <div className="flex flex-wrap items-center gap-2 p-3 text-white">
        <p className="flex-1 min-w-[220px] text-sm font-bold">
          Pasport raqami, QR kod va boshqa shaxsiy joylarni sichqoncha yoki barmoq bilan belgilang — ular xiralashadi.
        </p>
        <button
          type="button"
          onClick={() => setRects((list) => list.slice(0, -1))}
          disabled={!rects.length || saving}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold bg-white/10 hover:bg-white/20 disabled:opacity-40"
        >
          <Undo2 className="w-4 h-4" /> Orqaga
        </button>
        <button type="button" onClick={onCancel} disabled={saving} className="px-4 py-2 rounded-xl text-sm font-bold bg-white/10 hover:bg-white/20">
          Bekor qilish
        </button>
        <button
          type="button"
          onClick={save}
          disabled={!rects.length || saving || !!error}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-[#FFB800] text-black hover:bg-yellow-400 disabled:opacity-40"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />} Saqlash ({rects.length})
        </button>
      </div>
      <div className="flex-1 min-h-0 flex items-center justify-center p-3 pt-0">
        {error ? (
          <p className="text-red-400 font-bold">{error}</p>
        ) : !img ? (
          <Loader2 className="w-10 h-10 text-white/70 animate-spin" />
        ) : (
          <canvas
            ref={canvasRef}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={() => ((start.current = null), setDraft(null))}
            className="max-w-full max-h-full rounded-lg cursor-crosshair touch-none select-none"
          />
        )}
      </div>
    </div>,
    document.body
  );
}
