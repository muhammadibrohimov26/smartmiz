import Link from "next/link";
import { BookOpen, Inbox, Trophy } from "lucide-react";
import { getCourses, getLeads, getNews } from "@/lib/data";
import { ensureAdminPage } from "@/lib/auth";

async function AdminDashboard() {
  await ensureAdminPage();
  const [courses, news, leads] = await Promise.all([getCourses({ strict: true }), getNews({ strict: true }), getLeads()]);
  const newLeads = leads.filter((l) => l.status === "new").length;

  const cards = [
    { href: "/admin/leads", label: "Yangi arizalar", value: newLeads, icon: Inbox, highlight: newLeads > 0 },
    { href: "/admin/courses", label: "Kurslar", value: courses.length, icon: BookOpen },
    { href: "/admin/news", label: "Natijalar", value: news.length, icon: Trophy },
  ];

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-6">Bosh sahifa</h1>
      <div className="grid sm:grid-cols-3 gap-4">
        {cards.map(({ href, label, value, icon: Icon, highlight }) => (
          <Link
            key={href}
            href={href}
            className={`p-6 rounded-2xl border-2 bg-white dark:bg-zinc-900 transition-shadow hover:shadow-[4px_4px_0px_0px_rgba(255,184,0,1)] ${
              highlight ? "border-[#FFB800]" : "border-zinc-900 dark:border-zinc-800"
            }`}
          >
            <Icon className="w-6 h-6 mb-3 text-yellow-600 dark:text-yellow-400" />
            <p className="text-4xl font-black">{value}</p>
            <p className="text-sm font-bold text-zinc-500">{label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;
