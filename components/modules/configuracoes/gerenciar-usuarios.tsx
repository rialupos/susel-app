"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { criarUsuario, alterarSenha, toggleUsuario } from "@/actions/usuarios";
import { useRouter } from "next/navigation";
import { UserPlus, Loader2, KeyRound, UserCheck, UserX, Eye, EyeOff } from "lucide-react";

interface Usuario {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
  createdAt: Date;
}

const inputClass = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20";

export function GerenciarUsuarios({ usuarios }: { usuarios: Usuario[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alterandoSenha, setAlterandoSenha] = useState<string | null>(null);
  const [novaSenha, setNovaSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [form, setForm] = useState({ nome: "", email: "", senha: "" });

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleCriar() {
    if (!form.nome.trim() || !form.email.trim() || !form.senha.trim()) {
      toast.error("Preencha todos os campos.");
      return;
    }
    setLoading(true);
    try {
      await criarUsuario(form);
      toast.success("Usuário criado com sucesso!");
      setForm({ nome: "", email: "", senha: "" });
      setShowForm(false);
      router.refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao criar usuário.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAlterarSenha(id: string) {
    if (!novaSenha.trim() || novaSenha.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    setLoading(true);
    try {
      await alterarSenha(id, novaSenha);
      toast.success("Senha alterada com sucesso!");
      setAlterandoSenha(null);
      setNovaSenha("");
      router.refresh();
    } catch {
      toast.error("Erro ao alterar senha.");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(id: string, ativo: boolean) {
    try {
      await toggleUsuario(id, !ativo);
      toast.success(ativo ? "Usuário desativado." : "Usuário reativado.");
      router.refresh();
    } catch {
      toast.error("Erro ao alterar status.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Usuários do Sistema</h2>
            <p className="text-sm text-slate-500 mt-0.5">{usuarios.length} usuário(s) cadastrado(s)</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <UserPlus className="w-4 h-4" />
            Novo usuário
          </Button>
        </div>

        {/* Formulário novo usuário */}
        {showForm && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 space-y-3">
            <p className="text-sm font-medium text-slate-700">Novo usuário</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                className={inputClass}
                placeholder="Nome completo *"
                value={form.nome}
                onChange={e => set("nome", e.target.value)}
              />
              <input
                className={inputClass}
                placeholder="E-mail *"
                type="email"
                value={form.email}
                onChange={e => set("email", e.target.value)}
              />
            </div>
            <div className="relative">
              <input
                className={inputClass}
                placeholder="Senha inicial *"
                type={showSenha ? "text" : "password"}
                value={form.senha}
                onChange={e => set("senha", e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowSenha(!showSenha)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowForm(false)} disabled={loading}>
                Cancelar
              </Button>
              <Button onClick={handleCriar} disabled={loading}>
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Criando...</> : "Criar usuário"}
              </Button>
            </div>
          </div>
        )}

        {/* Lista de usuários */}
        <div className="space-y-3">
          {usuarios.map((u) => (
            <div key={u.id} className={`border rounded-xl p-4 ${u.ativo ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50 opacity-60"}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-slate-800">{u.nome}</p>
                  <p className="text-sm text-slate-500">{u.email}</p>
                  <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${u.ativo ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-500"}`}>
                    {u.ativo ? "Ativo" : "Inativo"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setAlterandoSenha(alterandoSenha === u.id ? null : u.id)}
                    className="text-slate-400 hover:text-primary transition-colors"
                    title="Alterar senha"
                  >
                    <KeyRound className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggle(u.id, u.ativo)}
                    className={`transition-colors ${u.ativo ? "text-slate-400 hover:text-red-500" : "text-slate-400 hover:text-green-500"}`}
                    title={u.ativo ? "Desativar" : "Reativar"}
                  >
                    {u.ativo ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Alterar senha inline */}
              {alterandoSenha === u.id && (
                <div className="mt-3 flex gap-2">
                  <input
                    className={`${inputClass} flex-1`}
                    placeholder="Nova senha (mín. 6 caracteres)"
                    type="password"
                    value={novaSenha}
                    onChange={e => setNovaSenha(e.target.value)}
                  />
                  <Button size="sm" onClick={() => handleAlterarSenha(u.id)} disabled={loading}>
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Salvar"}
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => { setAlterandoSenha(null); setNovaSenha(""); }}>
                    Cancelar
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
