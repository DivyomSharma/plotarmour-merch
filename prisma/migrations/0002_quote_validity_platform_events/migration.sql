-- AlterTable
ALTER TABLE "Quote" ADD COLUMN     "validUntil" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "AuditEvent" ALTER COLUMN "organizationId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "OutboxEvent" ALTER COLUMN "organizationId" DROP NOT NULL;