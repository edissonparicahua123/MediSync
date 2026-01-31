/*
  Warnings:

  - You are about to drop the column `createdAt` on the `system_configs` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `system_configs` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `system_configs` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `system_configs` table. All the data in the column will be lost.
  - You are about to drop the column `serviceName` on the `system_configs` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[documentId]` on the table `employees` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[key]` on the table `system_configs` will be added. If there are existing duplicate values, this will fail.
  - Made the column `email` on table `organization_configs` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phone` on table `organization_configs` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `key` to the `system_configs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `system_configs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `system_configs` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "audit_logs_createdAt_idx";

-- DropIndex
DROP INDEX "system_configs_category_idx";

-- DropIndex
DROP INDEX "system_configs_isActive_idx";

-- DropIndex
DROP INDEX "system_configs_serviceName_key";

-- AlterTable
ALTER TABLE "backup_logs" ADD COLUMN     "url" TEXT,
ALTER COLUMN "type" DROP DEFAULT,
ALTER COLUMN "status" DROP DEFAULT;

-- AlterTable
ALTER TABLE "employees" ADD COLUMN     "bankAccount" TEXT,
ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "bonus" DECIMAL(10,2) DEFAULT 0,
ADD COLUMN     "documentId" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "organization_configs" ADD COLUMN     "branding" JSONB,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "hospitalName" DROP DEFAULT,
ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "phone" SET NOT NULL;

-- AlterTable
ALTER TABLE "system_configs" DROP COLUMN "createdAt",
DROP COLUMN "duration",
DROP COLUMN "isActive",
DROP COLUMN "price",
DROP COLUMN "serviceName",
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "key" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL,
ADD COLUMN     "value" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "doctor_documents" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "size" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "doctorId" TEXT NOT NULL,

    CONSTRAINT "doctor_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "doctor_documents_doctorId_idx" ON "doctor_documents"("doctorId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE UNIQUE INDEX "employees_documentId_key" ON "employees"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "system_configs_key_key" ON "system_configs"("key");

-- AddForeignKey
ALTER TABLE "doctor_documents" ADD CONSTRAINT "doctor_documents_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
