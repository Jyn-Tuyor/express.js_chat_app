-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Profile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "year_level" TEXT,
    "gender" TEXT,
    "hobby_1" TEXT,
    "hobby_2" TEXT,
    "not_good" TEXT,
    "bio" TEXT,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Profile" ("bio", "gender", "hobby_1", "hobby_2", "id", "not_good", "userId", "year_level") SELECT "bio", "gender", "hobby_1", "hobby_2", "id", "not_good", "userId", "year_level" FROM "Profile";
DROP TABLE "Profile";
ALTER TABLE "new_Profile" RENAME TO "Profile";
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
