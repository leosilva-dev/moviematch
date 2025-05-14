import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchFromTMDB } from "@/lib/tmdb";

type TMDBMovie = {
  id: number;
  title: string;
  poster_path: string | null;
};

type Provider = {
  provider_name: string;
  logo_path: string | null;
  provider_id: number;
};

type WatchProviderResponse = {
  results: {
    [key: string]: {
      flatrate?: Provider[];
      rent?: Provider[];
      buy?: Provider[];
    };
  };
};

export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  const code = params.code;

  if (!code) {
    return NextResponse.json({ error: "code obrigatório" }, { status: 400 });
  }

  try {
    const session = await prisma.session.findUnique({
      where: { code },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Sessão não encontrada" },
        { status: 404 }
      );
    }

    const votes = await prisma.votes.findMany({
      where: { sessionId: session.id },
      orderBy: { votes: "desc" },
    });

    const movieData = await Promise.all(
      votes
        .filter((movie) => movie.votes >= 2)
        .map(async ({ movieId, votes }) => {
          const movieRes = await fetchFromTMDB(`/movie/${movieId}`);
          const movieData = (await movieRes.json()) as TMDBMovie;

          const providersRes = await fetchFromTMDB(
            `/movie/${movieId}/watch/providers?watch_region=BR`
          );
          const providersData =
            (await providersRes.json()) as WatchProviderResponse;

          const flatrateProviders = providersData.results?.BR?.flatrate || [];

          return {
            movieId,
            votes,
            title: movieData.title,
            poster: movieData.poster_path
              ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}`
              : null,
            providers: flatrateProviders.map((provider) => ({
              id: provider.provider_id,
              name: provider.provider_name,
              logo: provider.logo_path
                ? `https://image.tmdb.org/t/p/w92${provider.logo_path}`
                : null,
            })),
          };
        })
    );

    return NextResponse.json(movieData, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar resultados:", error);
    return NextResponse.json(
      { error: "Erro ao buscar resultados" },
      { status: 500 }
    );
  }
}
