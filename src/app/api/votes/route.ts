import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const { sessionId, movieId } = body;

  console.log("sessionId", { sessionId });
  console.log("movieId", { movieId });

  if (!sessionId || !movieId) {
    return NextResponse.json(
      { error: "sessionId e movieId são obrigatórios" },
      { status: 400 }
    );
  }

  try {
    const vote = await prisma.votes.upsert({
      where: {
        sessionId_movieId: {
          sessionId,
          movieId,
        },
      },
      update: {
        votes: { increment: 1 },
      },
      create: {
        sessionId,
        movieId,
        votes: 1,
      },
    });

    return NextResponse.json(vote, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Erro ao registrar voto", details: err },
      { status: 500 }
    );
  }
}
