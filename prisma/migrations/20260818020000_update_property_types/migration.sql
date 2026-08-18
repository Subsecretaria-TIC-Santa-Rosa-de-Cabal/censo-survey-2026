-- Create new enum with updated property types
CREATE TYPE "PropertyType_new" AS ENUM (
  'housing',
  'farm',
  'commercial_premises',
  'factory',
  'warehouse',
  'lot',
  'wellness_center',
  'educational_center',
  'senior_center',
  'hospital',
  'stadium',
  'church',
  'municipality',
  'police_station',
  'other'
);

-- Alter column to use new enum, mapping old values to new ones
ALTER TABLE "housing" ALTER COLUMN "property_type" DROP DEFAULT;
ALTER TABLE "housing" ALTER COLUMN "property_type" TYPE "PropertyType_new" USING (
  CASE "property_type"::text
    WHEN 'rural_housing' THEN 'housing'
    WHEN 'apartment' THEN 'housing'
    WHEN 'house' THEN 'housing'
    WHEN 'commercial_premises' THEN 'commercial_premises'
    WHEN 'other' THEN 'other'
    ELSE 'housing'
  END::"PropertyType_new"
);
ALTER TABLE "housing" ALTER COLUMN "property_type" SET DEFAULT 'housing';
ALTER TABLE "housing" ALTER COLUMN "property_type" SET NOT NULL;

-- Drop old enum
DROP TYPE "PropertyType";

-- Rename new enum
ALTER TYPE "PropertyType_new" RENAME TO "PropertyType";
