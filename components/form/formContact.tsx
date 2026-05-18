"use client";

import { sendContactMessage } from "@/lib/actions";
import { contactSchema } from "@/lib/validation";
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
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Select } from "@radix-ui/react-select";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

function ContactForm() {
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const courseParam = searchParams.get("course");
  const { t } = useTranslation();

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
        form.reset();
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 p-8 bw-panel">
        <FormField
          control={form.control}
          name="tel"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  className="rounded-xl border-gray-200 dark:border-zinc-800 shadow-sm focus-visible:ring-1 focus-visible:ring-[#FFB800] focus-visible:border-[#FFB800] font-medium bg-gray-50 dark:bg-zinc-900 py-6"
                  type="number"
                  placeholder={t("contactPhone")}
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
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
                  className="rounded-xl border-gray-200 dark:border-zinc-800 shadow-sm focus-visible:ring-1 focus-visible:ring-[#FFB800] focus-visible:border-[#FFB800] font-medium bg-gray-50 dark:bg-zinc-900 py-6"
                  placeholder={t("contactName")} 
                  disabled={isLoading} 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="kurs"
          render={({ field }) => (
            <FormItem>
              {/* <FormLabel>Email</FormLabel> */}
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="rounded-xl border-gray-200 dark:border-zinc-800 shadow-sm focus:ring-1 focus:ring-[#FFB800] font-medium bg-gray-50 dark:bg-zinc-900 py-6">
                    <SelectValue placeholder={t("contactCourse")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-xl border-gray-200 dark:border-zinc-800 font-medium bg-white dark:bg-zinc-900 shadow-lg">
                  <SelectItem disabled={isLoading} value="Koreys tili">{t("Koreys tili")}</SelectItem>
                  <SelectItem disabled={isLoading} value="Kompyuter kursi">{t("Kompyuter kursi")}</SelectItem>
				  <SelectItem disabled={isLoading} value="Arab tili">{t("Arab tili")}</SelectItem>
				  <SelectItem disabled={isLoading} value="Ingliz tili">{t("Ingliz tili")}</SelectItem>
				  <SelectItem disabled={isLoading} value="Roboto texnika">{t("Roboto texnika")}</SelectItem>
				  <SelectItem disabled={isLoading} value="Rus tili">{t("Rus tili")}</SelectItem>
				  <SelectItem disabled={isLoading} value="Turk tili">{t("Turk tili")}</SelectItem>
				  <SelectItem disabled={isLoading} value="Mental arifmetika">{t("Mental arifmetika")}</SelectItem>
                </SelectContent>
              </Select>

              <FormMessage />
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
