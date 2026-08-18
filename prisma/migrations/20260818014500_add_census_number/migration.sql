-- CreateSequence
CREATE SEQUENCE "household_survey_census_number_seq";

-- AlterTable
ALTER TABLE "household_survey" ADD COLUMN "census_number" INTEGER NOT NULL DEFAULT nextval('"household_survey_census_number_seq"');

-- CreateIndex
CREATE UNIQUE INDEX "household_survey_census_number_key" ON "household_survey"("census_number");

-- AlterSequence
ALTER SEQUENCE "household_survey_census_number_seq" OWNED BY "household_survey"."census_number";
