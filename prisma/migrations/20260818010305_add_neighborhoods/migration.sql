-- CreateTable
CREATE TABLE "neighborhood" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "comuna" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "neighborhood_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "neighborhood_name_key" ON "neighborhood"("name");
