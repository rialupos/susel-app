"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
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
  KanbanSquare,
  BookUser,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  alertCount?: number;
}

export function Sidebar({ alertCount = 0 }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const perfil = (session?.user as any)?.perfil ?? "SUSEL";
  const isSusel = perfil === "SUSEL";

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", suselOnly: true },
    { href: "/estagiarios", icon: Users, label: "Estagiarios", suselOnly: false },
    { href: "/vagas", icon: Briefcase, label: "Vagas", suselOnly: false },
    { href: "/recesso", icon: Palmtree, label: "Recesso", suselOnly: false },
    { href: "/renovacao", icon: RefreshCw, label: "Renovacao", suselOnly: false },
    { href: "/desligamento", icon: UserMinus, label: "Desligamento", suselOnly: false },
    { href: "/kanban", icon: KanbanSquare, label: "Contratacoes", suselOnly: false },
    { href: "/avaliacoes", icon: ClipboardCheck, label: "Avaliacao", suselOnly: false },
    { href: "/relatorios", icon: FileText, label: "Relatorios", suselOnly: false },
    { href: "/talentos", icon: BookUser, label: "Banco de Talentos", suselOnly: false },
    { href: "/configuracoes", icon: Settings, label: "Configuracoes", suselOnly: true },
    { href: "/admin/importar", icon: Upload, label: "Importar Excel", suselOnly: true },
  ];

  const itensFiltrados = navItems.filter(item => isSusel || !item.suselOnly);

  return (
    <aside className="w-64 min-h-screen bg-primary-dark flex flex-col">
      <div className="px-6 py-6 border-b border-primary">
        <h1 className="text-xl font-bold text-white tracking-widest">SUSEL</h1>
        <p className="text-blue-300 text-xs mt-0.5">TCDF - Gestao de Estagios</p>
        {!isSusel && (
          <p className="text-blue-400 text-xs mt-1 font-medium">
            {(session?.user as any)?.secretaria ?? "Grande Area"}
          </p>
        )}
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {itensFiltrados.map((item) => {
          const Icon = item.icon;
          const active = item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);
          const showBadge = alertCount > 0 && isSusel &&
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