/*
  Warnings:

  - The `height` column on the `patient_health_datas` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `weight` column on the `patient_health_datas` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "patient_health_datas" ALTER COLUMN "gender" DROP NOT NULL,
ALTER COLUMN "dateOfBirth" DROP NOT NULL,
ALTER COLUMN "bloodGroup" DROP NOT NULL,
DROP COLUMN "height",
ADD COLUMN     "height" INTEGER,
DROP COLUMN "weight",
ADD COLUMN     "weight" INTEGER;
