-- Create new enum with updated ethnic affiliation values
CREATE TYPE "EthnicAffiliation_new" AS ENUM (
  'indigenous',
  'gitano_rom',
  'raizal',
  'palenquero',
  'negro',
  'mulato',
  'afrodescendant',
  'afrocolombian',
  'not_applicable'
);

-- Alter column type with mapping from old values
ALTER TABLE "person" ALTER COLUMN "ethnic_affiliation" DROP DEFAULT;
ALTER TABLE "person" ALTER COLUMN "ethnic_affiliation" TYPE "EthnicAffiliation_new" USING (
  CASE "ethnic_affiliation"::text
    WHEN 'indigenous' THEN 'indigenous'
    WHEN 'non_indigenous' THEN 'not_applicable'
    ELSE 'not_applicable'
  END::"EthnicAffiliation_new"
);
ALTER TABLE "person" ALTER COLUMN "ethnic_affiliation" SET NOT NULL;

-- Drop old enum
DROP TYPE "EthnicAffiliation";

-- Rename new enum
ALTER TYPE "EthnicAffiliation_new" RENAME TO "EthnicAffiliation";
