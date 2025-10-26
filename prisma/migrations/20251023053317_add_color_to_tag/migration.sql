/*
  Warnings:

  - Added the required column `color` to the `Tag` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Tag" ADD COLUMN     "color" TEXT;

-- Update existing tags with a default color based on their name hash
UPDATE "public"."Tag"
SET "color" = (
  ARRAY['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16']
)[1 + (('x' || substring(md5(name), 1, 8))::bit(32)::int % 10)]
WHERE "color" IS NULL;

-- Make the column NOT NULL after setting default values
ALTER TABLE "public"."Tag" ALTER COLUMN "color" SET NOT NULL;
