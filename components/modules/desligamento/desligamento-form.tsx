"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField, inputClass, selectClass } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { formatDate, formatCPF, secretariaLabel } from "@/lib/utils";
import { registrarDesligamento } from "@/actions/desligamento";
import { MOTIVOS_DESLIGAMENTO } from "@/lib/constants";
import { AlertTriangle, UserMinus, Loader2, Search } from "lucide-react";

const schema = z
  .object({
    dataUltimoDia: z.string().min(1, "Informe a data do último dia"),
    motivo: z.enum(["TERMINO_CONTRATO", "INICIATIVA_ESTAGIARIO", "INICIATIVA_TCDF", "OUTROS"]),
    observacoes: z.string().optional(),
  })
  .refine(
    (d) => d.motivo === "TERMINO_CONTRATO" || (d.observacoes?.trim() ?? "").length > 0,
    { message: "Observações são obrigatórias para este motivo.", path: ["observacoes"] }
  );

type FormData = z.infer<typeof schema>;

type EstagiarioBasico = {
  id: string;
  nome: string;
  cpf: string;
  dataInicio: Date;
  dataFim: Date;
  dataLimiteContrato: Date;
  tipo: string;
  vaga: { id: string; codigo: string; secretaria: string };
};

interface DesligamentoFormProps {
  estagiarios: EstagiarioBasico[];
  estagiarioIdInicial?: string;
}

export function DesligamentoForm({ estagiarios, estagiarioIdInicial }: DesligamentoFormProps) {
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [selecionado, setSelecionado] = useState<EstagiarioBasico | null>(
    estagiarios.find((e) => e.id === estagiarioIdInicial) ?? null
  );
  const [confirmarOpen, setConfirmarOpen] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      dataUltimoDia: selecionado
        ? new Date(selecionado.dataFim).toISOString().split("T")[0]
        : "",
      motivo: "TERMINO_CONTRATO",
    },
  });

  const motivo = watch("motivo");

  const estagiariosFiltrados = estagiarios.filter(
    (e) =>
      e.nome.toLowerCase().includes(busca.toLowerCase()) ||
      e.vaga.codigo.toLowerCase().includes(busca.toLowerCase())
  );

  function onSubmit(data: FormData) {
    if (!selecionado) return toast.error("Selecione um estagiário.");
    setFormData(data);
    setConfirmarOpen(true);
  }

  async function handleConfirmar() {
    if (!selecionado || !formData) return;
    setLoading(true);
    try {
      await registrarDesligamento({ estagiarioId: selecionado.id, ...formData });
      toast.success(`${selecionado.nome} desligado. Vaga ${selecionado.vaga.codigo} liberada.`);
      setConfirmarOpen(false);
      router.push(`/estagiarios/${selecionado.id}`);
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao registrar desligamento.");
      setLoading(false);
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Seleção do estagiário */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
          <h3 className="font-semibold text-slate-800">Selecionar Estagiário</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome ou vaga..."
              className={inputClass + " pl-9"}
            />
          </div>
          <div className="max-h-96 overflow-y-auto border border-slate-100 rounded-lg divide-y divide-slate-50">
            {estagiariosFiltrados.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">Nenhum estagiário ativo encontrado.</p>
            ) : (
              estagiariosFiltrados.map((e) => (
                <button
                  key={e.id}
                  onClick={() => setSelecionado(e)}
                  className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition ${selecionado?.id === e.id ? "bg-red-50 border-l-2 border-alert-red" : ""}`}
                >
                  <p className="font-medium text-slate-800 text-sm">{e.nome}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {e.vaga.codigo} · {secretariaLabel(e.vaga.secretaria)}
                  </p>
                  <p className="text-xs text-slate-400">
                    Contrato: {formatDate(e.dataInicio)} → {formatDate(e.dataFim)}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Formulário */}
        <div className="space-y-4">
          {selecionado && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <UserMinus className="w-4 h-4 text-red-600" />
                <span className="font-semibold text-red-800 text-sm">Desligando: {selecionado.nome}</span>
              </div>
              <p className="text-xs text-red-700">
                CPF: {formatCPF(selecionado.cpf)} · Vaga: {selecionado.vaga.codigo}
              </p>
              <p className="text-xs text-red-700 mt-0.5">
                A vaga <strong>{selecionado.vaga.codigo}</strong> ficará disponível automaticamente após o desligamento.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <h3 className="font-semibold text-slate-800">Dados do Desligamento</h3>

            <FormField label="Data do último dia" error={errors.dataUltimoDia?.message} required>
              <input type="date" {...register("dataUltimoDia")} className={inputClass} />
            </FormField>

            <FormField label="Motivo" error={errors.motivo?.message} required>
              <select {...register("motivo")} className={selectClass}>
                {MOTIVOS_DESLIGAMENTO.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </FormField>

            <FormField
              label="Observações"
              error={errors.observacoes?.message}
              required={motivo !== "TERMINO_CONTRATO"}
            >
              <textarea
                {...register("observacoes")}
                rows={3}
                className={inputClass}
                placeholder={
                  motivo === "TERMINO_CONTRATO"
                    ? "Opcional para término de contrato..."
                    : "Obrigatório para este motivo..."
                }
              />
              {motivo !== "TERMINO_CONTRATO" && (
                <p className="text-xs text-amber-600 flex items-center gap-1 mt-1">
                  <AlertTriangle className="w-3 h-3" />
                  Observações obrigatórias para este motivo.
                </p>
              )}
            </FormField>

            <Button
              type="submit"
              variant="danger"
              className="w-full"
              disabled={!selecionado}
            >
              <UserMinus className="w-4 h-4" />
              Registrar Desligamento
            </Button>
          </form>
        </div>
      </div>

      {/* Dialog de confirmação */}
      <Dialog
        open={confirmarOpen}
        onClose={() => !loading && setConfirmarOpen(false)}
        title="Confirmar Desligamento"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
              <div className="space-y-1 text-sm">
                <p className="font-semibold text-red-800">Esta ação não pode ser desfeita.</p>
                <p className="text-red-700">
                  <strong>{selecionado?.nome}</strong> será desligado e a vaga{" "}
                  <strong>{selecionado?.vaga.codigo}</strong> ficará disponível imediatamente.
                </p>
                <p className="text-red-700">
                  Último dia: <strong>{formData?.dataUltimoDia ? formatDate(formData.dataUltimoDia) : ""}</strong>
                </p>
                <p className="text-red-700">
                  Motivo: <strong>{MOTIVOS_DESLIGAMENTO.find((m) => m.value === formData?.motivo)?.label}</strong>
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setConfirmarOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleConfirmar} disabled={loading}>
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Desligando...</>
                : <><UserMinus className="w-4 h-4" /> Confirmar Desligamento</>
              }
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
