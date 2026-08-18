-- AlterTable
ALTER TABLE "housing" ADD COLUMN "contact_number" TEXT NOT NULL DEFAULT '';

-- DropDefault
ALTER TABLE "housing" ALTER COLUMN "contact_number" DROP DEFAULT;

-- AlterTable
ALTER TABLE "person" ALTER COLUMN "phone_number" DROP NOT NULL;
