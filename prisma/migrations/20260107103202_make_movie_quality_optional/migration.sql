-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Rating" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "movieId" TEXT NOT NULL,
    "scream" INTEGER NOT NULL,
    "psychological" INTEGER NOT NULL,
    "suspense" INTEGER NOT NULL,
    "movieQuality" INTEGER DEFAULT 0,
    "review" TEXT,
    "author" TEXT NOT NULL DEFAULT 'Anonymous',
    CONSTRAINT "Rating_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Rating" ("author", "createdAt", "id", "movieId", "movieQuality", "psychological", "review", "scream", "suspense") SELECT "author", "createdAt", "id", "movieId", "movieQuality", "psychological", "review", "scream", "suspense" FROM "Rating";
DROP TABLE "Rating";
ALTER TABLE "new_Rating" RENAME TO "Rating";
CREATE INDEX "Rating_movieId_idx" ON "Rating"("movieId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
