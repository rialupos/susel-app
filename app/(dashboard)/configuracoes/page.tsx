import { Header } from "@/components/layout/header";
import { listarUsuarios } from "@/actions/usuarios";
import { GerenciarUsuarios } from "@/components/modules/configuracoes/gerenciar-usuarios";

export default async function ConfiguracoesPage() {
  const usuarios = await listarUsuarios();

  return (
    <>
      <Header title="Configurações" />
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          <GerenciarUsuarios usuarios={usuarios} />
        </div>
      </div>
    </>
  );
}
