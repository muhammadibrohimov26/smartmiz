"use client";

import { useCallback, useRef, useState } from "react";
import { EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { shrinkImage } from "@/lib/shrinkImage";
import Redactor from "./redactor";

const inputClass = "rounded-xl bg-zinc-50 dark:bg-zinc-950";

export function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string | number;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        className={inputClass}
      />
    </div>
  );
}

export function TextArea({ label, name, defaultValue }: { label: string; name: string; defaultValue?: string }) {
  return (
    <div className="space-y-1.5 sm:col-span-2">
      <Label htmlFor={name}>{label}</Label>
      <textarea
        id={name}
        name={name}
        defaultValue={defaultValue}
        rows={3}
        className="w-full rounded-xl border border-input bg-zinc-50 dark:bg-zinc-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </div>
  );
}

// shrinkImage aims for 850 KB; lib/media.ts accepts up to 900 KB
const SHRUNK_MAX_BYTES = 900 * 1024;
// Longest side below this: the picture will look blurry on the site
const LOW_RES = 1200;

// Image either from an uploaded file (shrunk in the browser, stored in Firestore
// — see lib/media.ts) or an existing URL. With `redact`, a button opens an
// editor to hide the passport number, QR code etc. (certificates).
export function ImageField({ defaultValue, label = "Rasm", redact }: { defaultValue?: string; label?: string; redact?: boolean }) {
  const [preview, setPreview] = useState(defaultValue ?? "");
  const [info, setInfo] = useState<{ text: string; error?: boolean } | null>(null);
  const [editing, setEditing] = useState(false);
  // Full-quality original of the file picked now (for the redaction editor)
  const [source, setSource] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const closeEditor = useCallback(() => setEditing(false), []);

  // The edited image goes into the file input, so the form uploads it
  async function onRedacted(file: File) {
    setEditing(false);
    const input = fileRef.current;
    if (!input) return;
    if (file.size > SHRUNK_MAX_BYTES) return setInfo({ text: "Rasm juda katta boʻlib qoldi, boshqa rasm tanlang.", error: true });
    const dt = new DataTransfer();
    dt.items.add(file);
    input.files = dt.files;
    input.setCustomValidity("");
    setPreview(URL.createObjectURL(file));
    setSource(null); // editing again continues from this version, keeping its hidden areas
    setInfo({ text: `🔒 Shaxsiy maʼlumotlar yashirildi · ${Math.round(file.size / 1024)} KB — «Saqlash»ni bosing` });
  }

  async function onFile(input: HTMLInputElement) {
    const original = input.files?.[0];
    input.setCustomValidity("");
    if (!original) return setInfo(null);
    // Until the shrunk copy is in place the browser refuses to submit the form,
    // otherwise the full-size photo goes out (and can exceed Vercel's request limit)
    input.setCustomValidity("Rasm tayyorlanmoqda, biroz kuting...");
    setInfo({ text: "Rasm kichraytirilmoqda..." });
    const file = await shrinkImage(original);
    if (file.size > SHRUNK_MAX_BYTES) {
      // The browser could not read or shrink it (e.g. an iPhone HEIC photo)
      input.value = "";
      input.setCustomValidity("");
      setPreview(defaultValue ?? "");
      return setInfo({ text: "Bu rasmni kichraytirib boʻlmadi. JPG yoki PNG formatdagi rasm tanlang.", error: true });
    }
    // Put the shrunk file back into the input so the form submits it
    const dt = new DataTransfer();
    dt.items.add(file);
    input.files = dt.files;
    input.setCustomValidity("");
    setPreview(URL.createObjectURL(file));
    // The editor works from the original (one compression only, not two)
    setSource(URL.createObjectURL(original));
    const img = await createImageBitmap(file).catch(() => null);
    const size = `${img ? `${img.width}×${img.height}, ` : ""}${Math.round(file.size / 1024)} KB`;
    // A small picture cannot become sharp on the site — say so while there is
    // still a chance to pick the original file
    if (img && Math.max(img.width, img.height) < LOW_RES) {
      return setInfo({ text: `${size} — rasm kichik, saytda xira koʻrinadi. Iloji boʻlsa, asl (kattaroq) faylni yuklang.`, error: true });
    }
    setInfo({ text: size });
  }

  return (
    <div className="space-y-1.5 sm:col-span-2">
      <Label>{label}</Label>
      <div className="flex gap-4 items-start">
        <div className="w-24 h-24 shrink-0 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 overflow-hidden">
          {preview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="w-full h-full object-cover" />
          )}
        </div>
        <div className="flex-1 space-y-2">
          <Input
            ref={fileRef}
            name="imageFile"
            type="file"
            accept="image/*"
            className={inputClass}
            onChange={(e) => onFile(e.currentTarget)}
          />
          {info && <p className={`text-xs font-bold ${info.error ? "text-red-500" : "text-emerald-600"}`}>{info.text}</p>}
          {redact && preview && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-zinc-900 text-white dark:bg-white dark:text-black hover:bg-[#FFB800] hover:text-black"
            >
              <EyeOff className="w-3.5 h-3.5" /> Pasport raqami, QR kodni yashirish
            </button>
          )}
          {editing && <Redactor src={source ?? preview} onDone={onRedacted} onCancel={closeEditor} />}
          <Input
            name="image"
            defaultValue={defaultValue}
            placeholder="yoki rasm manzili (URL)"
            className={inputClass}
            onChange={(e) => setPreview(e.target.value)}
          />
          <p className="text-xs text-zinc-500">
            Fayl tanlansa, URL o&apos;rniga yuklangan fayl ishlatiladi. Katta rasm avtomatik kichraytiriladi.
          </p>
        </div>
      </div>
    </div>
  );
}

export function FormActions({ pending, onCancel }: { pending: boolean; onCancel: () => void }) {
  return (
    <div className="flex gap-2 sm:col-span-2 justify-end">
      <button
        type="button"
        onClick={onCancel}
        disabled={pending}
        className="px-5 py-2.5 rounded-xl font-bold text-sm border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
      >
        Bekor qilish
      </button>
      <button
        type="submit"
        disabled={pending}
        className="px-5 py-2.5 rounded-xl font-bold text-sm bg-[#FFB800] text-black hover:bg-yellow-400 disabled:opacity-50"
      >
        {pending ? "Saqlanmoqda..." : "Saqlash"}
      </button>
    </div>
  );
}

export function PageHeader({ title, onAdd }: { title: string; onAdd?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">{title}</h1>
      {onAdd && (
        <button
          onClick={onAdd}
          className="px-4 py-2.5 rounded-xl font-bold text-sm bg-black dark:bg-white text-white dark:text-black hover:bg-[#FFB800] dark:hover:bg-[#FFB800] hover:text-black transition-colors"
        >
          + Qo&apos;shish
        </button>
      )}
    </div>
  );
}
