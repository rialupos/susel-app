import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const talento = await prisma.talento.findUnique({
    where: { id: params.id },
    select: { curriculo: true, curriculoNome: true },
  });

  if (!talento?.curriculo) {
    return new NextResponse("Curriculo nao encontrado.", { status: 404 });
  }

  return new NextResponse(talento.curriculo, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${talento.curriculoNome ?? "curriculo.pdf"}"`,
    },
  });
}