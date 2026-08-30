-- AlterTable
ALTER TABLE "characters" ADD COLUMN "base_url" TEXT;
ALTER TABLE "characters" ADD COLUMN "model" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN "base_url" TEXT;
ALTER TABLE "users" ADD COLUMN "default_model" TEXT;
