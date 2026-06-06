"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { editarEstagiario } from "@/actions/editar-estagiario";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";

interface EstagiarioEditData {
  id: string;
  nome: string;
  cpf: string;
  nivel: string;
  curso: string;
  horario: string;
  instituicaoEnsino: string;
  tipoVaga: string;
  estagiarioSubstituidoNome?: string | null;
  dataInicio: string;
  dataFim: string;
  dataLimiteContrato: string;
  lotacao: string;
  unidadeGestora: string;
  secretariaInterna?: string | null;
  atividadesDesenvolvidas?: string | null;
  edocContratacao?: string | null;
  observacoes?: string | null;
  supervisorNome: string;
  supervisorCargo?: string | null;
  supervisorFormacao?: string | null;
  supervisorRamal?: string | null;
  vaga: { codigo: string; secretaria: string };
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      {children}
    </div>
  );
}

const inputClass = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
const selectClass = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white";

export function EditarEstagiarioForm({ estagiario }: { estagiario: EstagiarioEditData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nome: estagiario.nome,
    cpf: estagiario.cpf,
    nivel: estagiario.nivel,
    curso: estagiario.curso,
    horario: estagiario.horario,
    instituicaoEnsino: estagiario.instituicaoEnsino,
    tipoVaga: estagiario.tipoVaga,
    estagiarioSubstituidoNome: estagiario.estagiarioSubstituidoNome ?? "",
    dataInicio: estagiario.dataInicio.slice(0, 10),
    dataFim: estagiario.dataFim.slice(0, 10),
    dataLimiteContrato: estagiario.dataLimiteContrato.slice(0, 10),
    lotacao: estagiario.lotacao,
    unidadeGestora: estagiario.unidadeGestora,
    secretariaInterna: estagiario.secretariaInterna ?? "",
    atividadesDesenvolvidas: estagiario.atividadesDesenvolvidas ?? "",
    edocContratacao: estagiario.edocContratacao ?? "",
    observacoes: estagiario.observacoes ?? "",
    supervisorNome: estagiario.supervisorNome,
    supervisorCargo: estagiario.supervisorCargo ?? "",
    supervisorFormacao: estagiario.supervisorFormacao ?? "",
    supervisorRamal: estagiario.supervisorRamal ?? "",
  });

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSalvar() {
    if (!form.nome.trim() || !form.cpf.trim() || !form.supervisorNome.trim()) {
      toast.error("Preencha os campos obrigatórios: nome, CPF e supervisor.");
      return;
    }
    setLoading(true);
    try {
      await editarEstagiario(estagiario.id, form);
      toast.success("Cadastro atualizado com sucesso!");
      router.push(`/estagiarios/${estagiario.id}`);
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao salvar alterações.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Link href={`/estagiarios/${estagiario.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary">
        <ArrowLeft className="w-4 h-4" /> Voltar para o cadastro
      </Link>

      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">

        {/* Dados pessoais */}
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">Dados Pessoais</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nome completo *">
              <input className={inputClass} value={form.nome} onChange={e => set("nome", e.target.value)} />
            </Field>
            <Field label="CPF *">
              <input className={inputClass} value={form.cpf} onChange={e => set("cpf", e.target.value)} />
            </Field>
            <Field label="Nível">
              <select className={selectClass} value={form.nivel} onChange={e => set("nivel", e.target.value)}>
                <option value="MEDIO">Médio</option>
                <option value="SUPERIOR">Superior</option>
                <option value="POS_GRADUACAO">Pós-graduação</option>
              </select>
            </Field>
            <Field label="Horário">
              <input className={inputClass} value={form.horario} onChange={e => set("horario", e.target.value)} />
            </Field>
            <Field label="Curso">
              <input className={inputClass} value={form.curso} onChange={e => set("curso", e.target.value)} />
            </Field>
            <Field label="Instituição de Ensino">
              <input className={inputClass} value={form.instituicaoEnsino} onChange={e => set("instituicaoEnsino", e.target.value)} />
            </Field>
          </div>
        </div>

        {/* Contrato */}
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">Contrato</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Vaga">
              <input className={inputClass} value={`${estagiario.vaga.codigo}`} disabled />
            </Field>
            <Field label="Tipo de Vaga">
              <select className={selectClass} value={form.tipoVaga} onChange={e => set("tipoVaga", e.target.value)}>
                <option value="NOVA">Nova vaga</option>
                <option value="SUBSTITUICAO">Substituição</option>
              </select>
            </Field>
            {form.tipoVaga === "SUBSTITUICAO" && (
              <Field label="Nome do estagiário substituído">
                <input className={inputClass} value={form.estagiarioSubstituidoNome} onChange={e => set("estagiarioSubstituidoNome", e.target.value)} />
              </Field>
            )}
            <Field label="Data de início">
              <input type="date" className={inputClass} value={form.dataInicio} onChange={e => set("dataInicio", e.target.value)} />
            </Field>
            <Field label="Data de fim">
              <input type="date" className={inputClass} value={form.dataFim} onChange={e => set("dataFim", e.target.value)} />
            </Field>
            <Field label="Data limite do contrato">
              <input type="date" className={inputClass} value={form.dataLimiteContrato} onChange={e => set("dataLimiteContrato", e.target.value)} />
            </Field>
            <Field label="e-DOC Contratação">
              <input className={inputClass} value={form.edocContratacao} onChange={e => set("edocContratacao", e.target.value)} />
            </Field>
          </div>
        </div>

        {/* Lotação */}
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">Lotação</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Lotação">
              <input className={inputClass} value={form.lotacao} onChange={e => set("lotacao", e.target.value)} />
            </Field>
            <Field label="Unidade Gestora">
              <input className={inputClass} value={form.unidadeGestora} onChange={e => set("unidadeGestora", e.target.value)} />
            </Field>
            <Field label="Secretaria Interna">
              <input className={inputClass} value={form.secretariaInterna} onChange={e => set("secretariaInterna", e.target.value)} />
            </Field>
            <Field label="Atividades Desenvolvidas">
              <input className={inputClass} value={form.atividadesDesenvolvidas} onChange={e => set("atividadesDesenvolvidas", e.target.value)} />
            </Field>
          </div>
        </div>

        {/* Supervisor */}
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">Supervisor</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nome do supervisor *">
              <input className={inputClass} value={form.supervisorNome} onChange={e => set("supervisorNome", e.target.value)} />
            </Field>
            <Field label="Cargo">
              <input className={inputClass} value={form.supervisorCargo} onChange={e => set("supervisorCargo", e.target.value)} />
            </Field>
            <Field label="Formação">
              <input className={inputClass} value={form.supervisorFormacao} onChange={e => set("supervisorFormacao", e.target.value)} />
            </Field>
            <Field label="Ramal">
              <input className={inputClass} value={form.supervisorRamal} onChange={e => set("supervisorRamal", e.target.value)} />
            </Field>
          </div>
        </div>

        {/* Observações */}
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">Observações</h3>
          <textarea
            className={`${inputClass} resize-none`}
            rows={3}
            value={form.observacoes}
            onChange={e => set("observacoes", e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
          <Link href={`/estagiarios/${estagiario.id}`}>
            <Button variant="secondary" disabled={loading}>Cancelar</Button>
          </Link>
          <Button onClick={handleSalvar} disabled={loading}>
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : <><Save className="w-4 h-4" /> Salvar alterações</>}
          </Button>
        </div>
      </div>
    </div>
  );
}
