-- CreateEnum
CREATE TYPE "ROLE" AS ENUM ('OWNER', 'MANAGER', 'ACCOUNTANT', 'VIEWER');

-- CreateTable
CREATE TABLE "USER" (
    "id" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "ROLE" NOT NULL DEFAULT 'OWNER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "USER_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "USER_userName_key" ON "USER"("userName");
