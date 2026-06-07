"use client";

import { useSession } from "next-auth/react";
import { Bell } from "lucide-react";

interface HeaderProps {
  title: string;
  alertCount?: number;
}

export function Header({ title, alertCount = 0 }: HeaderProps) {
  const { data: session } = useSession();

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
      <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
      <div className="flex items-center gap-4">
        {alertCount > 0 && (
          <div className="relative">
            <Bell className="w-5 h-5 text-slate-500" />
            <span className="absolute -top-1 -right-1 bg-alert-red text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {alertCount > 9 ? "9+" : alertCount}
            </span>
          </div>
        )}
        <div className="text-sm text-slate-600">
          <span className="font-medium">{session?.user?.name ?? "Usuário"}</span>
        </div>
      </div>
    </header>
  );
}
