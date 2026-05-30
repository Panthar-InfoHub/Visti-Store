-- AlterTable
ALTER TABLE "site_config" ADD COLUMN     "businessAddress" TEXT,
ADD COLUMN     "businessCin" TEXT,
ADD COLUMN     "businessEmail" TEXT,
ADD COLUMN     "businessGstin" TEXT,
ADD COLUMN     "businessName" TEXT,
ADD COLUMN     "businessPan" TEXT,
ADD COLUMN     "businessPhone" TEXT,
ADD COLUMN     "invoicePrefix" TEXT DEFAULT 'INV';
