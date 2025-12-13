/*
  Warnings:

  - A unique constraint covering the columns `[documentNumber]` on the table `patients` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "patients" ADD COLUMN     "documentNumber" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "patients_documentNumber_key" ON "patients"("documentNumber");
