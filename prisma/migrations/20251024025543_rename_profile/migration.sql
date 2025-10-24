/*
  Warnings:

  - You are about to drop the `UserProfile` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "UserProfile";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Profile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "year_level" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "hobby_1" TEXT NOT NULL,
    "hobby_2" TEXT NOT NULL,
    "not_good" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");
