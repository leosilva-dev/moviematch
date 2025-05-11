"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [customSessionCode, setCustomSessionCode] = useState("");

  async function handleCreateSession(sessionCode?: string) {
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: sessionCode }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Erro ao criar sessão");
      }

      const data = await res.json();
      router.push(`/session/${data.code}`);
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error("Erro desconhecido");
      }
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome</CardTitle>
          <CardDescription>
            Create or join a session to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Button
              onClick={() => handleCreateSession()}
              className="w-full h-12 text-lg font-medium"
              size="lg"
            >
              Create a new session
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gray-50 px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                value={customSessionCode}
                onChange={(e) => setCustomSessionCode(e.target.value)}
                className="h-12 text-lg"
                placeholder="Enter session code"
              />
            </div>
            <Button
              onClick={() => handleCreateSession(customSessionCode)}
              className="w-full h-12 text-lg font-medium"
              size="lg"
              variant="secondary"
            >
              Join session
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
