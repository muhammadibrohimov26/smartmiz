"use client";

import { FormEvent, useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Price } from "@/types";
import { deleteCourse, saveCourse } from "../actions";
import { Field, FormActions, ImageField, PageHeader } from "./fields";

function CourseManager({ courses }: { courses: Price[] }) {
  const [editing, setEditing] = useState<Price | "new" | null>(null);
  const [pending, startTransition] = useTransition();
  const current = editing === "new" ? undefined : editing ?? undefined;

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await saveCourse(formData);
      if (!res.success) return void toast.error(res.error);
      toast.success("Kurs saqlandi");
      setEditing(null);
    });
  }

  function onDelete(course: Price) {
    if (!course.id || !confirm(`"${course.courseName}" kursini o'chirasizmi?`)) return;
    startTransition(async () => {
      const res = await deleteCourse(course.id!);
      if (!res.success) return void toast.error(res.error);
      toast.success("Kurs o'chirildi");
    });
  }

  return (
    <div>
      <PageHeader title="Kurslar" onAdd={editing ? undefined : () => setEditing("new")} />

      {editing && (
        <form
          key={current?.id ?? "new"}
          onSubmit={onSubmit}
          className="grid sm:grid-cols-2 gap-4 p-6 mb-8 bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-800 rounded-2xl"
        >
          <h2 className="sm:col-span-2 text-lg font-black">
            {current ? "Kursni tahrirlash" : "Yangi kurs"}
          </h2>
          <input type="hidden" name="id" value={current?.id ?? ""} />
          <Field label="Kurs nomi" name="courseName" defaultValue={current?.courseName} required />
          <Field label="Yo'nalish (turi)" name="courseType" defaultValue={current?.courseType} placeholder="masalan: IT" />
          <Field label="Asl narxi (ming so'm)" name="coursePrice" type="number" defaultValue={current?.coursePrice} />
          <Field label="Chegirmali narxi (ming so'm)" name="courseChegirma" type="number" defaultValue={current?.courseChegirma} />
          <Field label="Davomiyligi (soat)" name="courseTime" defaultValue={current?.courseTime} placeholder="1.5" />
          <Field label="Chegirma matni" name="chegirma" defaultValue={current?.chegirma} />
          <ImageField defaultValue={current?.image} />
          <FormActions pending={pending} onCancel={() => setEditing(null)} />
        </form>
      )}

      {courses.length === 0 ? (
        <p className="text-zinc-500">Hozircha kurslar yo&apos;q.</p>
      ) : (
        <div className="grid gap-3">
          {courses.map((course) => (
            <div
              key={course.id}
              className="flex items-center gap-4 p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl"
            >
              <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-[#FFB800]">
                {course.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={course.image} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black truncate">{course.courseName}</p>
                <p className="text-sm text-zinc-500">
                  {course.courseChegirma} / <span className="line-through">{course.coursePrice}</span> ming so&apos;m · {course.courseTime} soat
                </p>
              </div>
              <button
                onClick={() => setEditing(course)}
                disabled={pending}
                className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                aria-label="Tahrirlash"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(course)}
                disabled={pending}
                className="p-2 rounded-lg text-red-500 hover:bg-red-500/10"
                aria-label="O'chirish"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CourseManager;
