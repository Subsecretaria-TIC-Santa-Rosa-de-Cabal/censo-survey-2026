-- CreateEnum
CREATE TYPE "Relationship" AS ENUM (
  'head_of_household',
  'partner',
  'spouse',
  'son_daughter',
  'stepchild',
  'grandparent',
  'nephew_niece',
  'grandchild',
  'uncle_aunt',
  'father',
  'mother',
  'father_in_law_mother_in_law',
  'brother_sister',
  'half_brother_half_sister',
  'son_in_law',
  'daughter_in_law',
  'brother_in_law_sister_in_law',
  'cousin',
  'other_relative',
  'non_relative',
  'not_informed'
);

-- AlterTable
ALTER TABLE "person" ADD COLUMN "relationship" "Relationship" NOT NULL DEFAULT 'not_informed';
