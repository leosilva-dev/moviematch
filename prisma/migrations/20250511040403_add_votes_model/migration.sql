-- CreateTable
CREATE TABLE "Votes" (
    "id" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "movieId" TEXT NOT NULL,
    "votes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Votes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Votes_sessionId_movieId_key" ON "Votes"("sessionId", "movieId");

-- AddForeignKey
ALTER TABLE "Votes" ADD CONSTRAINT "Votes_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
