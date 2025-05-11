import { NextResponse } from "next/server";
import { fetchFromTMDB } from "@/lib/tmdb";
import { Movie, TMDBResponse } from "@/types/tmdb";

const GENEROS_EXCLUIDOS = [16]; // 16 = Animation

function shuffleArray<T>(array: T[]): T[] {
  return array
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
}

export async function GET() {
  try {
    const pages = await Promise.all([
      fetchFromTMDB("/movie/popular?page=1"),
      fetchFromTMDB("/movie/popular?page=2"),
      fetchFromTMDB("/movie/popular?page=3"),
    ]);

    const data = await Promise.all(pages.map((res) => res.json()));
    const allResults = data.flatMap(
      (page: TMDBResponse<Movie>) => page.results
    );
    const shuffledResults = shuffleArray(allResults);
    const filteredResults = shuffledResults.filter(
      (filme) => !filme.genre_ids.some((id) => GENEROS_EXCLUIDOS.includes(id))
    );

    return NextResponse.json(
      { results: filteredResults },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        },
      }
    );
  } catch (error) {
    console.error("Erro ao buscar filmes populares:", error);
    return NextResponse.json(
      { error: "Falha ao buscar filmes populares" },
      { status: 500 }
    );
  }
}
