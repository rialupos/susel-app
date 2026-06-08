"use client";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";
import { confirmarInicio } from "@/actions/estagiarios";

interface IniciarButtonProps {
  estagiarioId: string;
  nome: string;
}

export function IniciarButton({ estagiarioId, nome }: IniciarButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleIniciar() {
    if (!confirm(`Confirmar que ${nome} iniciou o estagio?`)) return;
    setLoading(true);
    try {
      await confirmarInicio(estagiarioId);
      toast.success(`${nome} iniciou o estagio!`);
      router.refresh();
    } catch (e) {
      toast.error("Erro ao confirmar inicio.");
      setLoading(false);
    }
  }

  return (
    <button
      onClick={(e) => { e.preventDefault(); handleIniciar(); }}
      disabled={loading}
      className="mt-2 w-full flex items-center justify-center gap-1.5 text-xs font-medium bg-green-600 hover:bg-green-700 text-white py-1.5 px-3 rounded-lg transition-colors disabled:opacity-50"
    >
      {loading ? <><Loader2 className="w-3 h-3 animate-spin" /> Confirmando...</> : <><CheckCircle className="w-3 h-3" /> Estagiario iniciou</>}
    </button>
  );
}