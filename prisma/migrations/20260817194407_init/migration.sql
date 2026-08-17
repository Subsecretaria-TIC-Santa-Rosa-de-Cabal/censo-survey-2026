-- CreateEnum
CREATE TYPE "SectorType" AS ENUM ('urban', 'rural');

-- CreateEnum
CREATE TYPE "TenureType" AS ENUM ('owner', 'tenant', 'occupant', 'possessor');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('habitable', 'uninhabitable', 'destroyed', 'damaged');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('rural_housing', 'apartment', 'house', 'commercial_premises', 'other');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('citizenship_id', 'identity_card', 'birth_certificate', 'passport', 'ppt', 'pep');

-- CreateEnum
CREATE TYPE "GenderIdentity" AS ENUM ('woman', 'man', 'other', 'prefer_not_to_say');

-- CreateEnum
CREATE TYPE "EthnicAffiliation" AS ENUM ('indigenous', 'non_indigenous');

-- CreateEnum
CREATE TYPE "PetType" AS ENUM ('dog', 'cat', 'bird', 'rabbit', 'other');

-- CreateTable
CREATE TABLE "household_survey" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "submitted_at" TIMESTAMP(3),

    CONSTRAINT "household_survey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "housing" (
    "id" TEXT NOT NULL,
    "survey_id" TEXT NOT NULL,
    "neighborhood_or_sector" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "sector_type" "SectorType" NOT NULL,
    "farm_name_or_reference" TEXT,
    "stratum" INTEGER NOT NULL,
    "tenure_type" "TenureType" NOT NULL,
    "property_status" "PropertyStatus" NOT NULL,
    "damage_description" TEXT,
    "was_evacuated" BOOLEAN NOT NULL,
    "property_type" "PropertyType" NOT NULL,
    "property_type_other" TEXT,
    "total_families" INTEGER NOT NULL,
    "household_members_count" INTEGER NOT NULL,
    "people_to_register" INTEGER NOT NULL,
    "pets_to_register" INTEGER NOT NULL DEFAULT 0,
    "longitude" DECIMAL(12,8),
    "latitude" DECIMAL(12,8),

    CONSTRAINT "housing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "person" (
    "id" TEXT NOT NULL,
    "survey_id" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL,
    "first_names" TEXT NOT NULL,
    "last_names" TEXT NOT NULL,
    "document_type" "DocumentType" NOT NULL,
    "document_number" TEXT NOT NULL,
    "gender_identity" "GenderIdentity" NOT NULL,
    "birth_date" DATE NOT NULL,
    "ethnic_affiliation" "EthnicAffiliation" NOT NULL,
    "phone_number" TEXT NOT NULL,

    CONSTRAINT "person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pet" (
    "id" TEXT NOT NULL,
    "survey_id" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL,
    "petType" "PetType" NOT NULL,
    "name" TEXT,

    CONSTRAINT "pet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "housing_survey_id_key" ON "housing"("survey_id");

-- CreateIndex
CREATE UNIQUE INDEX "person_survey_id_order_index_key" ON "person"("survey_id", "order_index");

-- CreateIndex
CREATE UNIQUE INDEX "pet_survey_id_order_index_key" ON "pet"("survey_id", "order_index");

-- AddForeignKey
ALTER TABLE "housing" ADD CONSTRAINT "housing_survey_id_fkey" FOREIGN KEY ("survey_id") REFERENCES "household_survey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "person" ADD CONSTRAINT "person_survey_id_fkey" FOREIGN KEY ("survey_id") REFERENCES "household_survey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pet" ADD CONSTRAINT "pet_survey_id_fkey" FOREIGN KEY ("survey_id") REFERENCES "household_survey"("id") ON DELETE CASCADE ON UPDATE CASCADE;
