"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Provider = {
  name: string;
  logo: string | null;
  id: number;
};

type Movie = {
  movieId: number;
  title: string;
  poster: string | null;
  votes: number;
  providers: Provider[];
};

export default function ResultsPage() {
  const { code } = useParams();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch(`/api/result/${code}`);
        const data = await res.json();
        setMovies(data);
      } catch (error) {
        console.error("Erro:", error);
      } finally {
        setLoading(false);
      }
    };

    if (code) fetchResults();
  }, [code]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-gray-600 text-lg">Carregando resultados...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="relative flex items-center mb-8">
          <Link href="/" className="text-blue-600 hover:underline absolute ">
            <Button className="cursor-pointer" variant={"ghost"}>
              <ChevronLeft />
              Voltar para o início
            </Button>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex-1 text-center">
            Resultados da Sessão <span className="text-blue-600">{code}</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {movies.map((movie, index) => (
            <Card
              key={movie.movieId}
              className="group flex flex-row overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-[250px]"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {movie.poster && (
                <div className="relative w-[40%] h-full ml-4">
                  <Image
                    src={movie.poster}
                    alt={movie.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              )}
              <CardContent className="flex-1 p-5 flex flex-col justify-between w-[60%]">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {movie.title}
                  </h2>
                </div>
                <div className="mt-4 flex flex-col space-y-2">
                  {movie.providers.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {movie.providers.map((provider) => (
                        <div
                          key={provider.id}
                          className="flex items-center space-x-2"
                        >
                          {provider.logo && (
                            <Image
                              src={provider.logo}
                              alt={provider.name}
                              width={24}
                              height={24}
                              className="object-contain"
                            />
                          )}
                          <span className="text-sm text-gray-600">
                            {provider.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Nenhum provedor disponível
                    </p>
                  )}
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-800 text-sm font-medium mt-2"
                  >
                    {movie.votes} voto{movie.votes !== 1 ? "s" : ""}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
