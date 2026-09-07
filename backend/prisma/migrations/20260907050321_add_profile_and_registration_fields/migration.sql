-- AlterTable
ALTER TABLE "saved_events" ADD COLUMN     "registered" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "address" TEXT,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "institution" TEXT,
ADD COLUMN     "profilePictureUrl" TEXT;
