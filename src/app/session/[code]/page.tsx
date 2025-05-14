"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Star, ChevronLeft, Loader2 } from "lucide-react";
import { motion, type PanInfo, useAnimationControls } from "framer-motion";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

type Session = {
  id: string;
  code: string;
  createdAt: string;
};

type Movie = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
};

type MovieCardData = {
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;
  releaseDate: string;
  rating: number;
};

export default function SessionPage() {
  const { code } = useParams<{ code: string }>();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [cards, setCards] = useState<MovieCardData[]>([]);
  const [moviesLoading, setMoviesLoading] = useState(true);
  const controls = useAnimationControls();
  const [isAnimating, setIsAnimating] = useState(false);

  const [currentMovieIndex, setCurrentMovieIndex] = useState(0);

  useEffect(() => {
    const fetchMovies = async () => {
      setMoviesLoading(true);
      try {
        const response = await fetch("/api/movies/popular");

        if (!response.ok) {
          throw new Error("Falha ao buscar filmes");
        }

        const data = await response.json();

        const movieCards: MovieCardData[] = data.results.map(
          (movie: Movie) => ({
            id: movie.id,
            title: movie.title,
            description: movie.overview,
            imageUrl: movie.poster_path
              ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
              : null,
            releaseDate: movie.release_date,
            rating: movie.vote_average,
          })
        );

        setCards(movieCards);
      } catch (err) {
        console.error("Erro ao buscar filmes:", err);
        setError(
          err instanceof Error ? err.message : "Erro ao carregar filmes"
        );
      } finally {
        setMoviesLoading(false);
      }
    };

    fetchMovies();
  }, []);

  useEffect(() => {
    if (isAnimating) {
      controls.set({ x: 0, rotate: 0 });
      setIsAnimating(false);
    }
  }, [cards, controls, isAnimating]);

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const threshold = 100;

    if (info.offset.x > threshold) {
      setIsAnimating(true);
      controls
        .start({
          x: 500,
          rotate: 30,
          transition: { duration: 0.3 },
        })
        .then(() => handleAccept(cards[currentMovieIndex].id));
    } else if (info.offset.x < -threshold) {
      setIsAnimating(true);
      controls
        .start({
          x: -500,
          rotate: -30,
          transition: { duration: 0.3 },
        })
        .then(() => handleReject(cards[currentMovieIndex].id));
    } else {
      controls.start({
        x: 0,
        rotate: 0,
        transition: { type: "spring", stiffness: 300, damping: 20 },
      });
    }
  };

  const moveToNextCard = () => {
    setCurrentMovieIndex((prevIndex) => {
      const nextIndex = prevIndex + 1;
      return nextIndex >= cards.length ? 0 : nextIndex;
    });
  };

  const handleReject = (movieId: number) => {
    console.log(`rejected ${movieId}`);
    setIsAnimating(true);
    moveToNextCard();
  };

  const handleAccept = async (movieId: number) => {
    if (!session) return;

    try {
      await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
          movieId: String(movieId),
        }),
      });
    } catch (error) {
      console.error("Erro ao registrar voto:", error);
    } finally {
      setIsAnimating(true);
      moveToNextCard();
    }
  };

  useEffect(() => {
    if (!code) return;

    const fetchSession = async () => {
      try {
        const res = await fetch(`/api/sessions/${code}`);
        if (!res.ok) {
          throw new Error("Session not found");
        }

        const data = await res.json();
        setSession(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Unknown error");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [code]);

  if (!session) return null;
  if (error) return <p className="p-4 text-red-500">Erro: {error}</p>;

  if (loading || moviesLoading) {
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
    <main className="flex min-h-screen items-center justify-center p-2 bg-gradient-to-b from-gray-200 via-white to-gray-50">
      <div className="w-full max-w-md mx-auto flex flex-col items-center">
        <div className="relative flex items-center mb-8 w-full">
          <Link href="/" className="hover:underline absolute ">
            <Button className="cursor-pointer" variant={"ghost"}>
              <ChevronLeft />
              Voltar
            </Button>
          </Link>
        </div>

        <div className="relative w-full min-h-[630px] flex items-center justify-center">
          {cards.length > 0 && (
            <>
              <motion.div
                key={cards[currentMovieIndex].id}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleDragEnd}
                animate={controls}
                initial={{ opacity: 0.8, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                whileDrag={{ scale: 1.05 }}
                style={{ width: "100%", position: "absolute" }}
                className="touch-none"
              >
                <Card className="w-full h-[600px] shadow-xl/30 overflow-hidden cursor-grab active:cursor-grabbing p-0 border-none">
                  <div className="relative w-full h-[400px] overflow-hidden">
                    <Image
                      src={cards[currentMovieIndex].imageUrl || ""}
                      alt={cards[currentMovieIndex].title}
                      fill
                      className="object-cover blur-xl scale-110"
                    />

                    <Image
                      src={cards[currentMovieIndex].imageUrl || ""}
                      alt={cards[currentMovieIndex].title}
                      fill
                      className="object-contain z-10"
                    />
                    <Badge className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded-full text-sm z-10">
                      <Star /> {cards[currentMovieIndex].rating.toFixed(1)}
                    </Badge>
                  </div>
                  <CardContent className="px-4">
                    <h2 className="text-xl font-bold text-gray-900">
                      {cards[currentMovieIndex].title}
                    </h2>
                    <p className="text-sm text-gray-400 mb-2">
                      {new Date(
                        cards[currentMovieIndex].releaseDate
                      ).toLocaleDateString("pt-BR")}
                    </p>
                    <p className="text-sm line-clamp-4">
                      {cards[currentMovieIndex].description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between w-full mt-6">
          <div className="flex gap-6">
            <Button
              onClick={() => handleReject(cards[currentMovieIndex].id)}
              size="lg"
              variant="outline"
              className="h-14 w-14 rounded-full border-red-500 bg-white group hover:bg-gradient-to-r from-red-500 to-red-600 text-red-500 hover:text-white cursor-pointer transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isAnimating}
            >
              <X className="h-8 w-8 group-hover:text-white" />
            </Button>
            <Button
              onClick={() => handleAccept(cards[currentMovieIndex].id)}
              size="lg"
              variant="outline"
              className="h-14 w-14 rounded-full border-green-500 bg-white group hover:bg-gradient-to-r from-green-500 to-green-600 text-green-500 hover:text-white cursor-pointer transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isAnimating}
            >
              <Check className="h-8 w-8 group-hover:text-white" />
            </Button>
          </div>
          <Link href={`/results/${code}`}>
            <Button className="h-14 px-6 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700 cursor-pointer transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center gap-2">
              <span className="text-base font-semibold">Resultados</span>
              <svg
                className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
