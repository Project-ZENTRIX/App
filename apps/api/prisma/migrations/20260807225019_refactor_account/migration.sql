/*
  Warnings:

  - You are about to drop the column `accountId` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `providerId` on the `account` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[provider,identifier]` on the table `account` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `identifier` to the `account` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "account" DROP COLUMN "accountId",
DROP COLUMN "password",
DROP COLUMN "providerId",
ADD COLUMN     "identifier" TEXT NOT NULL,
ADD COLUMN     "passwordHash" TEXT,
ADD COLUMN     "provider" TEXT NOT NULL DEFAULT 'credentials';

-- AlterTable
ALTER TABLE "session" ADD COLUMN     "revokedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'active';

-- CreateTable
CREATE TABLE "oauth_account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "scope" TEXT,
    "tokenType" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "oauth_account_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "oauth_account_userId_idx" ON "oauth_account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "oauth_account_provider_providerAccountId_key" ON "oauth_account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "account_provider_identifier_key" ON "account"("provider", "identifier");

-- AddForeignKey
ALTER TABLE "oauth_account" ADD CONSTRAINT "oauth_account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
