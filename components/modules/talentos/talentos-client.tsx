"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Upload, FileText, Trash2, Loader2, UserPlus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cadastrarTalento, excluirTalento } from "@/actions/talentos";
import { useRouter } from "next/navigation";

const AREAS = [
  "Administracao", "Arquitetura e Urbanismo", "Arquivologia", "Biblioteconomia",
  "Contabilidade", "Direito", "Economia", "Engenharia", "Ensino Medio",
  "Estatistica", "Historia", "Jornalismo e Comunicacao", "Letras", "Pedagogia",
  "Politicas Publicas", "Pos-Graduacao", "Relacoes Internacionais", "Saude",
  "Tecnologo", "TI",
];

interface Talento {
  id: string;
  nome: string;
  instituicaoEnsino: string;
  semestre: string;
  area: string;
  curriculoNome: string | null;
  createdAt: Date;
}

interface TalentosClientProps {
  talentos: Talento[];
  areas: string[];
}

function iniciais(nome: string) {
  return nome.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
}

export function TalentosClient({ talentos, areas }: TalentosClientProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [excluindo, setExcluindo] = useState<string | null>(null);
  const [filtroArea, setFiltroArea] = useState("");
  const [filtroBusca, setFiltroBusca] = useState("");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [form, setForm] = useState({ nome: "", instituicaoEnsino: "", semestre: "", area: "" });

  const talentosFiltrados = talentos.filter(t => {
    const matchArea = !filtroArea || t.area === filtroArea;
    const matchBusca = !filtroBusca || t.nome.toLowerCase().includes(filtroBusca.toLowerCase());
    return matchArea && matchBusca;
  });

  const total = talentos.length;
  const superior = talentos.filter(t => t.area !== "Ensino Medio").length;
  const medio = talentos.filter(t => t.area === "Ensino Medio").length;

  async function handleSalvar() {
    if (!form.nome || !form.instituicaoEnsino || !form.semestre || !form.area) {
      toast.error("Preencha todos os campos obrigatorios.");
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("nome", form.nome);
      fd.append("instituicaoEnsino", form.instituicaoEnsino);
      fd.append("semestre", form.semestre);
      fd.append("area", form.area);
      if (arquivo) fd.append("curriculo", arquivo);
      await cadastrarTalento(fd);
      toast.success("Curriculo cadastrado com sucesso!");
      setShowForm(false);
      setForm({ nome: "", instituicaoEnsino: "", semestre: "", area: "" });
      setArquivo(null);
      router.refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao cadastrar.");
    } finally {
      setLoading(false);
    }
  }

  async function handleExcluir(id: string, nome: string) {
    if (!confirm(`Excluir o curriculo de ${nome}?`)) return;
    setExcluindo(id);
    try {
      await excluirTalento(id);
      toast.success("Curriculo excluido.");
      router.refresh();
    } catch {
      toast.error("Erro ao excluir.");
    } finally {
      setExcluindo(null);
    }
  }

  function abrirPdf(id: string) {
    window.open(`/api/talentos/${id}/curriculo`, "_blank");
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f?.type === "application/pdf") {
      setArquivo(f);
    } else {
      toast.error("Apenas arquivos PDF sao aceitos.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Banco de Talentos</h1>
          <p className="text-gray-500 mt-1">Curriculos recebidos e cadastrados pela SUSEL</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <UserPlus className="w-4 h-4" />
          Cadastrar curriculo
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[["Total de curriculos", total], ["Nivel superior", superior], ["Ensino medio", medio]].map(([label, valor]) => (
          <div key={label} className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <p className="text-2xl font-semibold text-slate-800">{valor}</p>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-slate-800">Novo cadastro</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Nome completo</label>
              <input
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Nome do candidato"
                value={form.nome}
                onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Instituicao de ensino</label>
              <input
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Ex: IESB, UniCEUB..."
                value={form.instituicaoEnsino}
                onChange={e => setForm(f => ({ ...f, instituicaoEnsino: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Semestre / Ano</label>
              <input
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Ex: 4 semestre, 3 ano..."
                value={form.semestre}
                onChange={e => setForm(f => ({ ...f, semestre: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Area</label>
              <select
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={form.area}
                onChange={e => setForm(f => ({ ...f, area: e.target.value }))}
              >
                <option value="">Selecione a area...</option>
                {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Curriculo em PDF</label>
            <label
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition-colors ${dragOver ? "border-primary bg-blue-50" : "border-slate-200 hover:border-primary"}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <Upload className="w-6 h-6 text-slate-400 mb-2" />
              <span className="text-sm text-slate-500">
                {arquivo ? arquivo.name : "Clique ou arraste o PDF aqui"}
              </span>
              <input type="file" accept=".pdf" className="hidden" onChange={e => setArquivo(e.target.files?.[0] ?? null)} />
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowForm(false)} disabled={loading}>Cancelar</Button>
            <Button onClick={handleSalvar} disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : "Salvar curriculo"}
            </Button>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none"
            placeholder="Buscar por nome..."
            value={filtroBusca}
            onChange={e => setFiltroBusca(e.target.value)}
          />
        </div>
        <select
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
          value={filtroArea}
          onChange={e => setFiltroArea(e.target.value)}
        >
          <option value="">Todas as areas</option>
          {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {talentosFiltrados.length === 0 ? (
          <p className="text-center text-slate-400 text-sm py-12">Nenhum curriculo encontrado.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {talentosFiltrados.map(t => (
              <div key={t.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-700 shrink-0">
                  {iniciais(t.nome)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">{t.nome}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{t.instituicaoEnsino} · {t.semestre}</p>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{t.area}</span>
                    <span className="text-xs text-slate-400">Cadastrado em {new Date(t.createdAt).toLocaleDateString("pt-BR")}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {t.curriculoNome && (
                    <Button size="sm" variant="secondary" onClick={() => abrirPdf(t.id)}>
                      <FileText className="w-3.5 h-3.5" />
                      Ver PDF
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleExcluir(t.id, t.nome)}
                    disabled={excluindo === t.id}
                  >
                    {excluindo === t.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5 text-red-500" />}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}