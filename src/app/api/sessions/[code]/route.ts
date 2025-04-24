import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.pathname.split("/").pop();

  try {
    const session = await prisma.session.findUnique({
      where: { code: String(code) },
    });

    if (!session) {
      return NextResponse.json(
        { message: "Sessão não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(session, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Erro ao buscar sessão", error },
      { status: 500 }
    );
  }
}
