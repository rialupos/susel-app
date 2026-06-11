"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const TCDF_LOGO = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAfQAAAH0CAYAAADL1t+KAAAQAElEQVR4Aey9B6BkSVU2fk7VDR1enjyb8+4sUZILyC4siCCIiIMBRfRDQBD8UBSM26uoKIKKiC6SRBH/s376IUGQsMsHCEqQ4CywZFh2dnd25s281N333qr6/07d7n7dL054b153z71Tp8KpdM6pqnMqvPdGUfEVEigkUEigkEAhgUICAy+BwqAP/BAWDBQSKCRQSKCQQCEBos016IWECwkUEigkUEigkEAhgTMigcKgnxExF50UEigkUEigkEAhgc2VwCAb9M2VTNF6IYFCAoUECgkUEhggCRQGfYAGqyC1kEAhgUIChQQKCawmgcKgryaZAl9IoJBAIYFCAoUEBkgChUEfoMEqSC0kUEigkEAhgUICq0mgMOirSWZz8UXrhQQKCRQSKCRQSGBDJVAY9A0VZ9FYIYFCAoUECgkUEtgaCRQGfWvkvrm9Fq0XEigkUEigkMBZJ4HCoJ91Q14wXEigkEAhgUIChQROQQKFQR/KUd1cnorWCwkUEigkUEigDyVQGPQ+HJSC";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      toast.error("E-mail ou senha invalidos.");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden md:flex flex-1 bg-[#184A8C] flex-col items-center justify-center px-12 py-16">
        <img
          src="/tcdf-logo.png"
          alt="Logo TCDF"
          width={120}
          height={120}
          style={{ marginBottom: "2rem" }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <h1 className="text-white text-3xl font-bold tracking-widest mb-2">SUSEL</h1>
        <p className="text-blue-200 text-sm text-center leading-relaxed">
          Supervisao de Selecao e<br />Gestao de Estagios
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 py-16 bg-white">
        <div className="w-full max-w-sm">
          <h2 className="text-xl font-semibold text-slate-800 mb-1">Bem-vindo</h2>
          <p className="text-sm text-slate-500 mb-8">Acesse o sistema com suas credenciais</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-slate-600 mb-1.5">
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="seu@tcdf.gov.br"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-slate-600 mb-1.5">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#184A8C] hover:bg-[#1a5299] disabled:opacity-60 text-white font-medium py-2.5 rounded-lg transition text-sm mt-2"
            >
              {loading ? "Entrando..." : "Entrar no sistema"}
            </button>
          </form>

          <p className="text-center text-slate-400 text-xs mt-10">
            SUSEL · SEGEP · TCDF · {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}