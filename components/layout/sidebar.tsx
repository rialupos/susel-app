"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Palmtree,
  RefreshCw,
  UserMinus,
  FileText,
  Settings,
  LogOut,
  Upload,
  ClipboardCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/estagiarios", icon: Users, label: "Estagiários" },
  { href: "/vagas", icon: Briefcase, label: "Vagas" },
  { href: "/recesso", icon: Palmtree, label: "Recesso" },
  { href: "/renovacao", icon: RefreshCw, label: "Renovação" },
  { href: "/desligamento", icon: UserMinus, label: "Desligamento" },
  { href: "/avaliacoes", icon: ClipboardCheck, label: "Avaliação" },
  { href: "/relatorios", icon: FileText, label: "Relatórios" },
  { href: "/configuracoes", icon: Settings, label: "Configurações" },
  { href: "/admin/importar", icon: Upload, label: "Importar Excel" },
];

interface SidebarProps {
  alertCount?: number;
}

export function Sidebar({ alertCount = 0 }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-primary-dark flex flex-col">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-primary">
        <h1 className="text-xl font-bold text-white tracking-widest">SUSEL</h1>
        <p className="text-blue-300 text-xs mt-0.5">TCDF · Gestão de Estágios</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          const showBadge =
            alertCount > 0 &&
            (item.href === "/dashboard" || item.href === "/renovacao");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-white"
                  : "text-blue-200 hover:bg-primary hover:text-white"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {showBadge && (
                <span className="bg-alert-red text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {alertCount > 99 ? "99+" : alertCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-primary">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-blue-300 hover:bg-primary hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sair do sistema
        </button>
      </div>
    </aside>
  );
}
