"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField, inputClass } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { formatDate, secretariaLabel, daysBetween } from "@/lib/utils";
import {
  registrarRecesso,
  validarElegibilidadeRecesso,
  type ValidacaoRecessoResult,
} from "@/actions/recesso";
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from "lucide-react";

const schema = z
  .object({
    dataInicioPeriodo: z.string().min(1, "Informe a data de início"),
    dataFimPeriodo: z.string().min(1, "Informe a data de fim"),
    quantidadeDias: z.coerce.number().min(1, "Informe a quantidade de dias"),
    observacoes: z.string().optional(),
  })
  .refine((d) => new Date(d.dataFimPeriodo) >= new Date(d.dataInicioPeriodo), {
    message: "Data de fim deve ser após o início",
    path: ["dataFimPeriodo"],
  });

type FormData = z.infer<typeof schema>;

type EstagiarioBasico = {
  id: string;
  nome: string;
  dataInicio: Date;
  dataFim: Date;
  vaga: { codigo: string; secretaria: string };
  recessos: { id: string; numeroRecesso: number; confirmado: boolean }[];
};

interface RecessoFormProps {
  estagiarios: EstagiarioBasico[];
  estagiarioIdInicial?: string;
}

export function RecessoForm({ estagiarios, estagiarioIdInicial }: RecessoFormProps) {
  const router = useRouter();
  const [estagiarioId, setEstagiarioId] = useState(estagiarioIdInicial ?? "");
  const [busca, setBusca] = useState("");
  const [elegibilidade, setElegibilidade] = useState<ValidacaoRecessoResult | null>(null);
  const [verificando, setVerificando] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const dataInicio = watch("dataInicioPeriodo");
  const dataFim = watch("dataFimPeriodo");

  useEffect(() => {
    if (dataInicio && dataFim && new Date(dataFim) >= new Date(dataInicio)) {
      const dias = daysBetween(new Date(dataInicio), new Date(dataFim)) + 1;
      setValue("quantidadeDias", dias);
    }
  }, [dataInicio, dataFim, setValue]);

  async function handleSelecionarEstagiario(id: string) {
    setEstagiarioId(id);
    setVerificando(true);
    setElegibilidade(null);
    try {
      const resultado = await validarElegibilidadeRecesso(id);
      setElegibilidade(resultado);
    } catch (e) {
      toast.error("Erro ao verificar elegibilidade.");
    } finally {
      setVerificando(false);
    }
  }

  async function onSubmit(data: FormData) {
    if (!estagiarioId) return toast.error("Selecione um estagiário.");
    if (!elegibilidade?.elegivel) return toast.error("Estagiário não elegível para recesso.");

    const diaSemana = new Date(data.dataInicioPeriodo + "T12:00:00").getDay();
    if (diaSemana < 1 || diaSemana > 3) {
      return toast.error("O início do recesso deve ser em dia útil (segunda a quarta-feira).");
    }

    setLoading(true);
    try {
      await registrarRecesso({ estagiarioId, ...data });
      toast.success("Recesso registrado! Pendente de confirmação pela SUSEL.");
      router.refresh();
      setEstagiarioId("");
      setElegibilidade(null);
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao registrar recesso.");
    } finally {
      setLoading(false);
    }
  }

  const estagiarioSelecionado = estagiarios.find((e) => e.id === estagiarioId);
  const estagiariosFiltrados = estagiarios.filter((e) =>
    e.nome.toLowerCase().includes(busca.toLowerCase()) ||
    e.vaga.codigo.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Seleção do estagiário */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Selecionar Estagiário</h3>

        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome ou código da vaga..."
          className={inputClass + " mb-3"}
        />

        <div className="max-h-48 overflow-y-auto border border-slate-100 rounded-lg divide-y divide-slate-50">
          {estagiariosFiltrados.map((e) => {
            const hoje = new Date();
            const anos = daysBetween(new Date(e.dataInicio), hoje) / 365;
            const recessosConfirmados = e.recessos.filter((r) => r.confirmado).length;

            return (
              <button
                key={e.id}
                onClick={() => handleSelecionarEstagiario(e.id)}
                className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition flex items-center justify-between ${estagiarioId === e.id ? "bg-primary/5 border-l-2 border-primary" : ""}`}
              >
                <div>
                  <p className="font-medium text-slate-800 text-sm">{e.nome}</p>
                  <p className="text-xs text-slate-500">
                    {e.vaga.codigo} · {secretariaLabel(e.vaga.secretaria)} · {anos.toFixed(1)} anos
                  </p>
                </div>
                <span className="text-xs text-slate-400">{recessosConfirmados}/2 recessos</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Status de elegibilidade */}
      {estagiarioId && (
        <div>
          {verificando ? (
            <div className="flex items-center gap-2 text-sm text-slate-500 p-4 bg-slate-50 rounded-xl">
              <Loader2 className="w-4 h-4 animate-spin" /> Verificando elegibilidade...
            </div>
          ) : elegibilidade ? (
            <div className={`p-4 rounded-xl border ${elegibilidade.elegivel ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
              <div className="flex items-center gap-2 mb-1">
                {elegibilidade.elegivel ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span className={`font-semibold text-sm ${elegibilidade.elegivel ? "text-green-800" : "text-red-800"}`}>
                  {elegibilidade.elegivel
                    ? `Elegível para Recesso ${elegibilidade.proximoNumero}`
                    : "Não elegível para recesso"}
                </span>
              </div>
              <p className="text-xs text-slate-600 ml-7">
                {elegibilidade.diasDesdeInicio} dias de contrato
                {estagiarioSelecionado && ` — Início: ${formatDate(estagiarioSelecionado.dataInicio)}`}
              </p>
              {elegibilidade.erros.map((err, i) => (
                <p key={i} className="text-xs text-red-700 ml-7 mt-1">{err}</p>
              ))}
            </div>
          ) : null}
        </div>
      )}

      {/* Formulário de recesso */}
      {elegibilidade?.elegivel && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-slate-800">
            Recesso {elegibilidade.proximoNumero} — {estagiarioSelecionado?.nome}
          </h3>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-800">
              O início do recesso deve ser em dia útil (segunda, terça ou quarta-feira).
              Alterações precisam de antecedência mínima de 15 dias.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Data de início" error={errors.dataInicioPeriodo?.message} required>
              <input type="date" {...register("dataInicioPeriodo")} className={inputClass} />
            </FormField>
            <FormField label="Data de fim" error={errors.dataFimPeriodo?.message} required>
              <input type="date" {...register("dataFimPeriodo")} className={inputClass} />
            </FormField>
            <FormField label="Quantidade de dias" error={errors.quantidadeDias?.message} required>
              <input type="number" {...register("quantidadeDias")} min={1} className={inputClass} />
            </FormField>
          </div>

          <FormField label="Observações" error={errors.observacoes?.message}>
            <textarea {...register("observacoes")} rows={2} className={inputClass}
              placeholder="Observações adicionais..." />
          </FormField>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Registrando...</> : "Registrar Recesso"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
