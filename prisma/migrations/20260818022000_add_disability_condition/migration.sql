-- CreateEnum
CREATE TYPE "DisabilityCondition" AS ENUM ('visual', 'auditory', 'physical', 'cognitive', 'none', 'other');

-- AlterTable
ALTER TABLE "person" ADD COLUMN "disability_condition" "DisabilityCondition" NOT NULL DEFAULT 'none';
ALTER TABLE "person" ADD COLUMN "disability_condition_other" TEXT;
