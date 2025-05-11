import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import { nanoid } from "nanoid";

export async function POST(req: Request) {
  let { code } = await req.json();

  if (!code) {
    code = nanoid(6);
  }

  const existingSession = await prisma.session.findUnique({
    where: { code },
  });

  try {
    if (!existingSession) {
      const session = await prisma.session.create({
        data: { code },
      });
      return NextResponse.json(session, { status: 201 });
    } else {
      return NextResponse.json({ code }, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json(
      { message: "Erro ao criar sessão", error },
      { status: 500 }
    );
  }
}
