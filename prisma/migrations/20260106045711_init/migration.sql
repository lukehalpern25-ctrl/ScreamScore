-- CreateTable
CREATE TABLE "Movie" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "year" INTEGER,
    "description" TEXT,
    "tagline" TEXT,
    "runtime" INTEGER,
    "tmdbId" INTEGER,
    "imdbId" TEXT,
    "posterPath" TEXT,
    "backdropPath" TEXT,
    "trailerKey" TEXT,
    "genres" TEXT,
    "tmdbRating" REAL,
    "tmdbVotes" INTEGER
);

-- CreateTable
CREATE TABLE "Rating" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "movieId" TEXT NOT NULL,
    "scream" INTEGER NOT NULL,
    "psychological" INTEGER NOT NULL,
    "suspense" INTEGER NOT NULL,
    "movieQuality" INTEGER NOT NULL,
    "review" TEXT,
    "author" TEXT NOT NULL DEFAULT 'Anonymous',
    CONSTRAINT "Rating_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Movie_tmdbId_key" ON "Movie"("tmdbId");

-- CreateIndex
CREATE INDEX "Movie_tmdbId_idx" ON "Movie"("tmdbId");

-- CreateIndex
CREATE INDEX "Movie_title_idx" ON "Movie"("title");

-- CreateIndex
CREATE INDEX "Rating_movieId_idx" ON "Rating"("movieId");
