-- CreateTable
CREATE TABLE "services_catalog" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "category" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_catalog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "services_catalog_category_idx" ON "services_catalog"("category");

-- CreateIndex
CREATE INDEX "services_catalog_isActive_idx" ON "services_catalog"("isActive");
