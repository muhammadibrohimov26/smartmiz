"use client";

import { useState, useTransition } from "react";
import { Check, Phone, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Lead, LeadStatus } from "@/types";
import { deleteLead, setLeadStatus } from "../actions";
import { PageHeader } from "./fields";

const filters: { value: LeadStatus | "all"; label: string }[] = [
  { value: "all", label: "Hammasi" },
  { value: "new", label: "Yangi" },
  { value: "contacted", label: "Bog'lanilgan" },
];

function formatDate(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function LeadsTable({ leads }: { leads: Lead[] }) {
  const [filter, setFilter] = useState<LeadStatus | "all">("all");
  const [pending, startTransition] = useTransition();
  const visible = filter === "all" ? leads : leads.filter((l) => l.status === filter);

  function toggle(lead: Lead) {
    startTransition(async () => {
      const res = await setLeadStatus(lead.id, lead.status === "new" ? "contacted" : "new");
      if (!res.success) toast.error(res.error);
    });
  }

  function onDelete(lead: Lead) {
    if (!confirm(`${lead.name} arizasini o'chirasizmi?`)) return;
    startTransition(async () => {
      const res = await deleteLead(lead.id);
      if (!res.success) return void toast.error(res.error);
      toast.success("Ariza o'chirildi");
    });
  }

  return (
    <div>
      <PageHeader title="Arizalar" />

      <div className="flex gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-bold border border-zinc-200 dark:border-zinc-800",
              filter === f.value && "bg-[#FFB800] text-black border-[#FFB800]"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="text-zinc-500">Arizalar yo&apos;q.</p>
      ) : (
        <div className="grid gap-3">
          {visible.map((lead) => (
            <div
              key={lead.id}
              className={cn(
                "flex flex-wrap items-center gap-4 p-4 bg-white dark:bg-zinc-900 border rounded-2xl",
                lead.status === "new" ? "border-[#FFB800]" : "border-zinc-200 dark:border-zinc-800 opacity-70"
              )}
            >
              <div className="flex-1 min-w-[180px]">
                <p className="font-black">{lead.name}</p>
                <p className="text-sm text-zinc-500">
                  {lead.kurs} · {formatDate(lead.createdAt)}
                </p>
              </div>
              <a
                href={`tel:${lead.tel}`}
                className="flex items-center gap-2 text-sm font-bold hover:text-yellow-600"
              >
                <Phone className="w-4 h-4" />
                {lead.tel}
              </a>
              <button
                onClick={() => toggle(lead)}
                disabled={pending}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold",
                  lead.status === "new"
                    ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                    : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                )}
              >
                {lead.status === "new" ? <Check className="w-3.5 h-3.5" /> : <RotateCcw className="w-3.5 h-3.5" />}
                {lead.status === "new" ? "Bog'lanildi" : "Yangi deb belgilash"}
              </button>
              <button
                onClick={() => onDelete(lead)}
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

export default LeadsTable;
