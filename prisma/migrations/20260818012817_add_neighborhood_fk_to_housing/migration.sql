-- AlterTable
ALTER TABLE "housing" ADD COLUMN     "neighborhood_id" TEXT,
ALTER COLUMN "neighborhood_or_sector" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "housing" ADD CONSTRAINT "housing_neighborhood_id_fkey" FOREIGN KEY ("neighborhood_id") REFERENCES "neighborhood"("id") ON DELETE SET NULL ON UPDATE CASCADE;
