import { buscarTalentos } from "@/actions/talentos";
import { Header } from "@/components/layout/header";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TalentosClient } from "@/components/modules/talentos/talentos-client";

const AREAS = [
  "Administracao", "Arquitetura e Urbanismo", "Arquivologia", "Biblioteconomia",
  "Contabilidade", "Direito", "Economia", "Engenharia", "Ensino Medio",
  "Estatistica", "Historia", "Jornalismo e Comunicacao", "Letras", "Pedagogia",
  "Politicas Publicas", "Pos-Graduacao", "Relacoes Internacionais", "Saude",
  "Tecnologo", "TI",
];

export default async function TalentosPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const talentos = await buscarTalentos({});

  return (
    <>
      <Header title="Banco de Talentos" />
      <div className="flex-1 p-6 overflow-y-auto">
        <TalentosClient talentos={talentos} areas={AREAS} />
      </div>
    </>
  );
}