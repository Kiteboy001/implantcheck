-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PAID', 'TOKEN_REDEEMED');

-- AlterEnum
ALTER TYPE "CaseTier" ADD VALUE 'PILOT_GUIDE';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "FileType" ADD VALUE 'PLY';
ALTER TYPE "FileType" ADD VALUE 'OBJ';

-- AlterTable
ALTER TABLE "cases" ADD COLUMN     "payment_status" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
ADD COLUMN     "reviewer_id" TEXT;

-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "anatomical_considerations" TEXT,
ADD COLUMN     "case_summary" TEXT,
ADD COLUMN     "prosthetic_considerations" TEXT,
ADD COLUMN     "recommendations" TEXT,
ADD COLUMN     "sac_classification" TEXT;

-- CreateTable
CREATE TABLE "tokens" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "tier" "CaseTier" NOT NULL,
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "used_by_id" TEXT,
    "used_case_id" TEXT,
    "used_at" TIMESTAMP(3),
    "created_by_id" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tokens_code_key" ON "tokens"("code");

-- CreateIndex
CREATE UNIQUE INDEX "tokens_used_case_id_key" ON "tokens"("used_case_id");

-- AddForeignKey
ALTER TABLE "cases" ADD CONSTRAINT "cases_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_used_by_id_fkey" FOREIGN KEY ("used_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_used_case_id_fkey" FOREIGN KEY ("used_case_id") REFERENCES "cases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
