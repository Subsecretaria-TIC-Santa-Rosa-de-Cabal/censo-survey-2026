-- CreateTable
CREATE TABLE "eps" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "eps_name_key" ON "eps"("name");

-- AlterTable
ALTER TABLE "person" ADD COLUMN "eps_id" TEXT;
ALTER TABLE "person" ADD COLUMN "eps_other" TEXT;

-- AddForeignKey
ALTER TABLE "person" ADD CONSTRAINT "person_eps_id_fkey" FOREIGN KEY ("eps_id") REFERENCES "eps"("id") ON DELETE SET NULL ON UPDATE CASCADE;
