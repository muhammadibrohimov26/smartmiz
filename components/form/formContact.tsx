"use client";

import { sendContactMessage } from "@/lib/actions";
import { contactSchema } from "@/lib/validation";
import { courseLabel, translatedCourseLabel, uniqueCourses } from "@/lib/courses";
import { Price } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "../ui/button";
import { useTranslation } from "@/context/LanguageContext";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  useFormField,
} from "../ui/form";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

// Schema messages are dictionary keys (see lib/validation.ts)
function TranslatedFormMessage() {
  const { error, formMessageId } = useFormField();
  const { t } = useTranslation();
  if (!error?.message) return null;
  return (
    <p id={formMessageId} className="text-sm font-medium text-destructive">
      {t(String(error.message))}
    </p>
  );
}

const inputClass =
  "rounded-xl border-gray-200 dark:border-zinc-800 shadow-sm focus-visible:ring-1 focus-visible:ring-[#FFB800] focus-visible:border-[#FFB800] font-medium bg-gray-50 dark:bg-zinc-900 py-6";

function ContactForm({ courses }: { courses: Price[] }) {
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const courseParam = searchParams.get("course");
  const { t } = useTranslation();

  const options = uniqueCourses(courses).map((c) => ({
    value: courseLabel(c),
    label: translatedCourseLabel(c, t),
  }));
  // Keep a course passed in the link even if it is not in the list (e.g. renamed later)
  if (courseParam && !options.some((o) => o.value === courseParam)) {
    options.unshift({ value: courseParam, label: t(courseParam) });
  }

  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      tel: "",
      name: "",
      kurs: courseParam || "",
    },
  });

  useEffect(() => {
    if (courseParam) {
      form.setValue("kurs", courseParam);
    }
  }, [courseParam, form]);

  function onSubmit(values: z.infer<typeof contactSchema>) {
    setIsLoading(true);

    const promise = sendContactMessage(values)
      .then((res) => {
        if (!res.success) throw new Error(res.error);
        form.reset({ tel: "", name: "", kurs: "" });
      })
      .finally(() => setIsLoading(false));

    toast.promise(promise, {
      loading: t("loading"),
      success: t("successMsg"),
      error: t("errorMsg"),
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 p-8 bw-panel" noValidate>
        <FormField
          control={form.control}
          name="tel"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  className={inputClass}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  required
                  aria-required="true"
                  placeholder={`${t("contactPhone")} *`}
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <TranslatedFormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  className={inputClass}
                  autoComplete="name"
                  required
                  aria-required="true"
                  placeholder={`${t("contactName")} *`}
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <TranslatedFormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="kurs"
          render={({ field }) => (
            <FormItem>
              <Select onValueChange={field.onChange} value={field.value || ""} key={field.value || "empty"} disabled={isLoading}>
                <FormControl>
                  <SelectTrigger aria-required="true" className="rounded-xl border-gray-200 dark:border-zinc-800 shadow-sm focus:ring-1 focus:ring-[#FFB800] font-medium bg-gray-50 dark:bg-zinc-900 py-6">
                    <SelectValue placeholder={`${t("contactCourse")} *`} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-xl border-gray-200 dark:border-zinc-800 font-medium bg-white dark:bg-zinc-900 shadow-lg">
                  {options.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <TranslatedFormMessage />
            </FormItem>
          )}
        />

        <Button
          className="w-full bw-button-solid text-[15px] py-6 mt-6 uppercase tracking-wider font-black flex items-center justify-center gap-2"
          size={"lg"}
          type="submit"
          disabled={isLoading}
        >
          <span>{t("btnSend")}</span>
          <Send className="w-5 h-5 ml-2" />
        </Button>
      </form>
    </Form>
  );
}

export default ContactForm;
