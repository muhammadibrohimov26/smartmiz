"use client";

import { FormEvent, useTransition } from "react";
import { toast } from "sonner";
import { SiteSettings } from "@/types";
import { formatCount } from "@/lib/numbers";
import { saveSettings } from "../actions";
import { Field, PageHeader } from "./fields";

function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [pending, startTransition] = useTransition();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await saveSettings(formData);
      if (!res.success) return void toast.error(res.error);
      toast.success("Saqlandi. Saytda bir necha soniyada yangilanadi.");
    });
  }

  return (
    <div>
      <PageHeader title="Sozlamalar" />

      <form
        onSubmit={onSubmit}
        className="max-w-md grid gap-4 p-6 bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-800 rounded-2xl"
      >
        <Field
          label="O'quvchilar soni"
          name="studentCount"
          type="number"
          defaultValue={settings.studentCount}
          required
        />
        <p className="-mt-2 text-xs text-zinc-500">
          Saytda &quot;{formatCount(settings.studentCount, "uz")}+&quot; ko&apos;rinishida chiqadi:
          &quot;Biz haqimizda&quot; va &quot;Muvaffaqiyatlar&quot; sahifalarida, barcha tillarda.
        </p>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={pending}
            className="px-5 py-2.5 rounded-xl font-bold text-sm bg-[#FFB800] text-black hover:bg-yellow-400 disabled:opacity-50"
          >
            {pending ? "Saqlanmoqda..." : "Saqlash"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SettingsForm;
