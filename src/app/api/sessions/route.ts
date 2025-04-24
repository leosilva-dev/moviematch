import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { code } = await req.json();

  const existingSession = await prisma.session.findUnique({
    where: { code },
  });

  if (existingSession) {
    return NextResponse.json(
      { message: "Sessão já existe com esse código." },
      { status: 400 }
    );
  }

  try {
    const session = await prisma.session.create({
      data: { code },
    });
    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Erro ao criar sessão", error },
      { status: 500 }
    );
  }
}
