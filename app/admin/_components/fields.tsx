"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { shrinkImage } from "@/lib/shrinkImage";

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

// Image either from an uploaded file (shrunk in the browser, stored in Firestore
// — see lib/media.ts) or an existing URL.
export function ImageField({ defaultValue, label = "Rasm" }: { defaultValue?: string; label?: string }) {
  const [preview, setPreview] = useState(defaultValue ?? "");
  const [info, setInfo] = useState("");

  async function onFile(input: HTMLInputElement) {
    const original = input.files?.[0];
    if (!original) return;
    setInfo("Rasm kichraytirilmoqda...");
    const file = await shrinkImage(original);
    // Put the shrunk file back into the input so the form submits it
    const dt = new DataTransfer();
    dt.items.add(file);
    input.files = dt.files;
    setPreview(URL.createObjectURL(file));
    const img = await createImageBitmap(file).catch(() => null);
    setInfo(`${img ? `${img.width}×${img.height}, ` : ""}${Math.round(file.size / 1024)} KB`);
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
            name="imageFile"
            type="file"
            accept="image/*"
            className={inputClass}
            onChange={(e) => onFile(e.currentTarget)}
          />
          {info && <p className="text-xs font-bold text-emerald-600">{info}</p>}
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
