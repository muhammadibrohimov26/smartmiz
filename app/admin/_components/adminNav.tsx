"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, ExternalLink, Inbox, LayoutDashboard, LogOut, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "../actions";

const links = [
  { href: "/admin", label: "Bosh sahifa", icon: LayoutDashboard },
  { href: "/admin/courses", label: "Kurslar", icon: BookOpen },
  { href: "/admin/news", label: "Natijalar", icon: Trophy },
  { href: "/admin/leads", label: "Arizalar", icon: Inbox },
];

function AdminNav({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function onLogout() {
    await logout();
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <aside className="md:w-60 md:min-h-screen border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 flex md:flex-col gap-4">
      <div className="hidden md:block px-2 py-3">
        <p className="text-lg font-black uppercase">Smartmiz</p>
        <p className="text-xs text-zinc-500 truncate">{email}</p>
      </div>

      <nav className="flex md:flex-col gap-1 flex-1 overflow-x-auto">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors hover:bg-[#FFB800]/20",
              pathname === href && "bg-[#FFB800]/15 text-yellow-700 dark:text-yellow-400"
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </Link>
        ))}
      </nav>

      <div className="flex md:flex-col gap-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <ExternalLink className="w-4 h-4" />
          <span className="hidden sm:inline">Saytni ochish</span>
        </Link>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-red-500 hover:bg-red-500/10"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Chiqish</span>
        </button>
      </div>
    </aside>
  );
}

export default AdminNav;
