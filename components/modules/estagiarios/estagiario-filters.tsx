"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { useCallback } from "react";

const SECRETARIAS = ["SEGEDAM", "SEGECEX", "PRESIDENCIA", "GABINETES", "ESTAGIDATA", "PCD"];
const STATUS = [
  { value: "ATIVO", label: "Ativo" },
  { value: "AGUARDANDO_CIDE", label: "Aguardando CIDE" },
  { value: "DESLIGADO", label: "Desligado" },
];
const TIPOS = [
  { value: "REGULAR", label: "Regular" },
  { value: "ESTAGIDATA", label: "ESTAGIDATA" },
  { value: "PCD", label: "PCD" },
  { value: "SUBSTITUTO", label: "Substituto" },
];
const NIVEIS = [
  { value: "MEDIO", label: "Médio" },
  { value: "SUPERIOR", label: "Superior" },
];

export function EstagiarioFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const clearAll = () => router.push(pathname);

  const hasFilters = searchParams.toString().length > 0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="flex flex-wrap gap-3 items-end">
        {/* Busca */}
        <div className="flex-1 min-w-48">
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Buscar por nome ou CPF
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              defaultValue={searchParams.get("busca") ?? ""}
              onChange={(e) => updateParam("busca", e.target.value)}
              placeholder="Nome ou CPF..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Secretaria */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Secretaria</label>
          <select
            value={searchParams.get("secretaria") ?? ""}
            onChange={(e) => updateParam("secretaria", e.target.value)}
            className="text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Todas</option>
            {SECRETARIAS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
          <select
            value={searchParams.get("status") ?? ""}
            onChange={(e) => updateParam("status", e.target.value)}
            className="text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Todos</option>
            {STATUS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Tipo */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Tipo</label>
          <select
            value={searchParams.get("tipo") ?? ""}
            onChange={(e) => updateParam("tipo", e.target.value)}
            className="text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Todos</option>
            {TIPOS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Nível */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Nível</label>
          <select
            value={searchParams.get("nivel") ?? ""}
            onChange={(e) => updateParam("nivel", e.target.value)}
            className="text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Todos</option>
            {NIVEIS.map((n) => (
              <option key={n.value} value={n.value}>{n.label}</option>
            ))}
          </select>
        </div>

        {hasFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 transition"
          >
            <X className="w-4 h-4" />
            Limpar
          </button>
        )}
      </div>
    </div>
  );
}
