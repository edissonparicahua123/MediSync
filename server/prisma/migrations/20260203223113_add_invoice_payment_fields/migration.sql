/*
  Warnings:

  - You are about to drop the column `prescribedBy` on the `patient_medications` table. All the data in the column will be lost.
  - You are about to drop the `bed_statuses` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "bed_statuses" DROP CONSTRAINT "bed_statuses_patientId_fkey";

-- AlterTable
ALTER TABLE "beds" ADD COLUMN     "diagnosis" TEXT,
ADD COLUMN     "estimatedDischarge" TIMESTAMP(3),
ADD COLUMN     "specialty" TEXT;

-- AlterTable
ALTER TABLE "emergency_cases" ADD COLUMN     "bedId" TEXT,
ADD COLUMN     "doctorId" TEXT,
ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "destinationAccountId" TEXT,
ADD COLUMN     "operationNumber" TEXT,
ADD COLUMN     "paymentDate" TIMESTAMP(3),
ADD COLUMN     "paymentMethod" TEXT;

-- AlterTable
ALTER TABLE "lab_orders" ADD COLUMN     "doctorId" TEXT,
ADD COLUMN     "resultFile" TEXT,
ADD COLUMN     "testId" TEXT,
ALTER COLUMN "testType" DROP NOT NULL,
ALTER COLUMN "testName" DROP NOT NULL;

-- AlterTable
ALTER TABLE "lab_results" ADD COLUMN     "attachmentUrl" TEXT;

-- AlterTable
ALTER TABLE "patient_medications" DROP COLUMN "prescribedBy",
ADD COLUMN     "prescribedById" TEXT,
ADD COLUMN     "status" TEXT DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "pharmacy_movements" ADD COLUMN     "resultingStock" INTEGER;

-- AlterTable
ALTER TABLE "pharmacy_orders" ADD COLUMN     "emergencyCaseId" TEXT;

-- DropTable
DROP TABLE "bed_statuses";

-- CreateTable
CREATE TABLE "lab_tests" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "normalRange" TEXT,
    "unit" TEXT,
    "price" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lab_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_vital_signs" (
    "id" TEXT NOT NULL,
    "emergencyCaseId" TEXT NOT NULL,
    "hr" DOUBLE PRECISION,
    "bp" TEXT,
    "temp" DOUBLE PRECISION,
    "spo2" DOUBLE PRECISION,
    "rr" DOUBLE PRECISION,
    "performedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "emergency_vital_signs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_medications" (
    "id" TEXT NOT NULL,
    "emergencyCaseId" TEXT NOT NULL,
    "medicationId" TEXT,
    "name" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "administeredBy" TEXT,
    "administeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "emergency_medications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_procedures" (
    "id" TEXT NOT NULL,
    "emergencyCaseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "performedBy" TEXT,
    "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "result" TEXT,

    CONSTRAINT "emergency_procedures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_attachments" (
    "id" TEXT NOT NULL,
    "emergencyCaseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "emergency_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "emergency_vital_signs_emergencyCaseId_idx" ON "emergency_vital_signs"("emergencyCaseId");

-- CreateIndex
CREATE INDEX "emergency_medications_emergencyCaseId_idx" ON "emergency_medications"("emergencyCaseId");

-- CreateIndex
CREATE INDEX "emergency_procedures_emergencyCaseId_idx" ON "emergency_procedures"("emergencyCaseId");

-- CreateIndex
CREATE INDEX "emergency_attachments_emergencyCaseId_idx" ON "emergency_attachments"("emergencyCaseId");

-- AddForeignKey
ALTER TABLE "patient_medications" ADD CONSTRAINT "patient_medications_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "medications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_medications" ADD CONSTRAINT "patient_medications_prescribedById_fkey" FOREIGN KEY ("prescribedById") REFERENCES "doctors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pharmacy_orders" ADD CONSTRAINT "pharmacy_orders_emergencyCaseId_fkey" FOREIGN KEY ("emergencyCaseId") REFERENCES "emergency_cases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_testId_fkey" FOREIGN KEY ("testId") REFERENCES "lab_tests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_cases" ADD CONSTRAINT "emergency_cases_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_cases" ADD CONSTRAINT "emergency_cases_bedId_fkey" FOREIGN KEY ("bedId") REFERENCES "beds"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_cases" ADD CONSTRAINT "emergency_cases_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_vital_signs" ADD CONSTRAINT "emergency_vital_signs_emergencyCaseId_fkey" FOREIGN KEY ("emergencyCaseId") REFERENCES "emergency_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_medications" ADD CONSTRAINT "emergency_medications_emergencyCaseId_fkey" FOREIGN KEY ("emergencyCaseId") REFERENCES "emergency_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_procedures" ADD CONSTRAINT "emergency_procedures_emergencyCaseId_fkey" FOREIGN KEY ("emergencyCaseId") REFERENCES "emergency_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_attachments" ADD CONSTRAINT "emergency_attachments_emergencyCaseId_fkey" FOREIGN KEY ("emergencyCaseId") REFERENCES "emergency_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
