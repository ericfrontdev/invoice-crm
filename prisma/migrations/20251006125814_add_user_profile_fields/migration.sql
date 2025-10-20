-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "address" TEXT,
ADD COLUMN     "company" TEXT,
ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "plan" TEXT DEFAULT 'free';
