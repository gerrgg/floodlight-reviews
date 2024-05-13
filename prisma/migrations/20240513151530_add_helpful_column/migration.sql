-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Review" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productVariantId" TEXT NOT NULL,
    "reviewContent" TEXT,
    "user_name" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "ipAddress" TEXT,
    "helpful" INTEGER NOT NULL DEFAULT 0,
    "is_public" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Review" ("createdAt", "id", "ipAddress", "is_public", "productId", "productVariantId", "rating", "reviewContent", "shop", "title", "user_name") SELECT "createdAt", "id", "ipAddress", "is_public", "productId", "productVariantId", "rating", "reviewContent", "shop", "title", "user_name" FROM "Review";
DROP TABLE "Review";
ALTER TABLE "new_Review" RENAME TO "Review";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
