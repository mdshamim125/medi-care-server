/*
  Warnings:

  - Added the required column `healthIssue` to the `prescriptions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable

ALTER TABLE "prescriptions"
ADD COLUMN "givenTest" TEXT,
ADD COLUMN "healthIssue" TEXT NOT NULL DEFAULT 'Not specified';