-- Rattrapage de l'historique de migrations.
-- Ces changements ont été appliqués à la base via `prisma db push` entre
-- octobre 2025 et septembre 2026 sans passer par une migration.
-- Sur une base existante, marquer cette migration comme déjà appliquée:
--   npx prisma migrate resolve --applied 20260903000000_sync_pushed_schema

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_clientId_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_clientId_fkey";

-- DropForeignKey
ALTER TABLE "UnpaidAmount" DROP CONSTRAINT "UnpaidAmount_clientId_fkey";

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "archived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "archivedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "paymentProvider" TEXT,
ADD COLUMN     "paymentTransactionId" TEXT,
ALTER COLUMN "tps" SET NOT NULL,
ALTER COLUMN "tvq" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "autoRemindersEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "betaTester" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "helcimCustomerCode" TEXT,
ADD COLUMN     "helcimCustomerId" TEXT,
ADD COLUMN     "helcimSessionId" TEXT,
ADD COLUMN     "helcimSubscriptionId" TEXT,
ADD COLUMN     "lifetimeDiscount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "logo" TEXT,
ADD COLUMN     "paymentProvider" TEXT,
ADD COLUMN     "paypalEmail" TEXT,
ADD COLUMN     "reminderMiseEnDemeureTemplate" TEXT DEFAULT 'Madame, Monsieur,

Malgré nos précédents rappels, nous constatons que la facture ci-dessous demeure impayée.

Nous vous prions de bien vouloir régulariser votre situation dans les plus brefs délais, faute de quoi nous serons contraints d''entamer des procédures de recouvrement.

Cordialement,',
ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "stripeSecretKey" TEXT,
ADD COLUMN     "stripeSubscriptionId" TEXT,
ADD COLUMN     "subscriptionEndsAt" TIMESTAMP(3),
ADD COLUMN     "subscriptionStatus" TEXT;

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceReminder" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentTo" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'sent',
    "errorMessage" TEXT,

    CONSTRAINT "InvoiceReminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "screenshot" TEXT,
    "pageUrl" TEXT NOT NULL,
    "pageTitle" TEXT,
    "userAgent" TEXT,
    "screenSize" TEXT,
    "deviceType" TEXT,
    "userId" TEXT,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'new',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "adminNote" TEXT,
    "linkedIssue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "viewedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "lastAdminReadAt" TIMESTAMP(3),
    "lastUserReadAt" TIMESTAMP(3),

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedbackMessage" (
    "id" TEXT NOT NULL,
    "feedbackId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "authorType" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeedbackMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" TEXT NOT NULL,
    "feedbackSystemEnabled" BOOLEAN NOT NULL DEFAULT true,
    "betaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "betaEndDate" TIMESTAMP(3),
    "maxBetaUsers" INTEGER NOT NULL DEFAULT 10,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookLog" (
    "id" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "headers" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "signature" TEXT,
    "status" INTEGER NOT NULL,
    "error" TEXT,
    "debugInfo" TEXT,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvitationCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "maxUses" INTEGER NOT NULL DEFAULT 1,
    "uses" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "usedBy" TEXT,
    "usedAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "InvitationCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentAgreement" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "numberOfInstallments" INTEGER NOT NULL,
    "frequency" INTEGER NOT NULL,
    "amountPerInstallment" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "token" TEXT NOT NULL,
    "confirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentAgreement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "PasswordResetToken_token_idx" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "PasswordResetToken_email_idx" ON "PasswordResetToken"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_email_token_key" ON "PasswordResetToken"("email", "token");

-- CreateIndex
CREATE INDEX "InvoiceReminder_invoiceId_idx" ON "InvoiceReminder"("invoiceId");

-- CreateIndex
CREATE INDEX "InvoiceReminder_type_idx" ON "InvoiceReminder"("type");

-- CreateIndex
CREATE INDEX "InvoiceReminder_sentAt_idx" ON "InvoiceReminder"("sentAt");

-- CreateIndex
CREATE INDEX "InvoiceReminder_status_idx" ON "InvoiceReminder"("status");

-- CreateIndex
CREATE INDEX "Feedback_userId_idx" ON "Feedback"("userId");

-- CreateIndex
CREATE INDEX "Feedback_status_idx" ON "Feedback"("status");

-- CreateIndex
CREATE INDEX "Feedback_type_idx" ON "Feedback"("type");

-- CreateIndex
CREATE INDEX "Feedback_severity_idx" ON "Feedback"("severity");

-- CreateIndex
CREATE INDEX "Feedback_createdAt_idx" ON "Feedback"("createdAt");

-- CreateIndex
CREATE INDEX "Feedback_priority_idx" ON "Feedback"("priority");

-- CreateIndex
CREATE INDEX "FeedbackMessage_feedbackId_idx" ON "FeedbackMessage"("feedbackId");

-- CreateIndex
CREATE INDEX "FeedbackMessage_authorId_idx" ON "FeedbackMessage"("authorId");

-- CreateIndex
CREATE INDEX "FeedbackMessage_createdAt_idx" ON "FeedbackMessage"("createdAt");

-- CreateIndex
CREATE INDEX "WebhookLog_endpoint_idx" ON "WebhookLog"("endpoint");

-- CreateIndex
CREATE INDEX "WebhookLog_processedAt_idx" ON "WebhookLog"("processedAt");

-- CreateIndex
CREATE INDEX "WebhookLog_status_idx" ON "WebhookLog"("status");

-- CreateIndex
CREATE UNIQUE INDEX "InvitationCode_code_key" ON "InvitationCode"("code");

-- CreateIndex
CREATE INDEX "InvitationCode_code_idx" ON "InvitationCode"("code");

-- CreateIndex
CREATE INDEX "InvitationCode_type_idx" ON "InvitationCode"("type");

-- CreateIndex
CREATE INDEX "InvitationCode_active_idx" ON "InvitationCode"("active");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentAgreement_projectId_key" ON "PaymentAgreement"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentAgreement_token_key" ON "PaymentAgreement"("token");

-- CreateIndex
CREATE INDEX "PaymentAgreement_projectId_idx" ON "PaymentAgreement"("projectId");

-- CreateIndex
CREATE INDEX "PaymentAgreement_token_idx" ON "PaymentAgreement"("token");

-- CreateIndex
CREATE INDEX "PaymentAgreement_status_idx" ON "PaymentAgreement"("status");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_read_idx" ON "Notification"("read");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_read_idx" ON "Notification"("userId", "read");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE INDEX "Client_userId_idx" ON "Client"("userId");

-- CreateIndex
CREATE INDEX "Client_email_idx" ON "Client"("email");

-- CreateIndex
CREATE INDEX "Client_archived_idx" ON "Client"("archived");

-- CreateIndex
CREATE INDEX "Client_createdAt_idx" ON "Client"("createdAt");

-- CreateIndex
CREATE INDEX "Expense_userId_idx" ON "Expense"("userId");

-- CreateIndex
CREATE INDEX "Expense_date_idx" ON "Expense"("date");

-- CreateIndex
CREATE INDEX "Expense_category_idx" ON "Expense"("category");

-- CreateIndex
CREATE INDEX "Expense_userId_date_idx" ON "Expense"("userId", "date");

-- CreateIndex
CREATE INDEX "Invoice_clientId_idx" ON "Invoice"("clientId");

-- CreateIndex
CREATE INDEX "Invoice_projectId_idx" ON "Invoice"("projectId");

-- CreateIndex
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");

-- CreateIndex
CREATE INDEX "Invoice_dueDate_idx" ON "Invoice"("dueDate");

-- CreateIndex
CREATE INDEX "Invoice_createdAt_idx" ON "Invoice"("createdAt");

-- CreateIndex
CREATE INDEX "Invoice_status_dueDate_idx" ON "Invoice"("status", "dueDate");

-- CreateIndex
CREATE INDEX "InvoiceItem_invoiceId_idx" ON "InvoiceItem"("invoiceId");

-- CreateIndex
CREATE INDEX "InvoiceItem_date_idx" ON "InvoiceItem"("date");

-- CreateIndex
CREATE INDEX "Note_clientId_idx" ON "Note"("clientId");

-- CreateIndex
CREATE INDEX "Note_createdAt_idx" ON "Note"("createdAt");

-- CreateIndex
CREATE INDEX "Project_clientId_idx" ON "Project"("clientId");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE INDEX "Project_createdAt_idx" ON "Project"("createdAt");

-- CreateIndex
CREATE INDEX "ProjectFile_projectId_idx" ON "ProjectFile"("projectId");

-- CreateIndex
CREATE INDEX "ProjectFile_uploadedAt_idx" ON "ProjectFile"("uploadedAt");

-- CreateIndex
CREATE INDEX "Revenue_userId_idx" ON "Revenue"("userId");

-- CreateIndex
CREATE INDEX "Revenue_date_idx" ON "Revenue"("date");

-- CreateIndex
CREATE INDEX "Revenue_category_idx" ON "Revenue"("category");

-- CreateIndex
CREATE INDEX "Revenue_userId_date_idx" ON "Revenue"("userId", "date");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "UnpaidAmount_clientId_idx" ON "UnpaidAmount"("clientId");

-- CreateIndex
CREATE INDEX "UnpaidAmount_invoiceId_idx" ON "UnpaidAmount"("invoiceId");

-- CreateIndex
CREATE INDEX "UnpaidAmount_status_idx" ON "UnpaidAmount"("status");

-- CreateIndex
CREATE INDEX "UnpaidAmount_dueDate_idx" ON "UnpaidAmount"("dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "User_helcimCustomerCode_key" ON "User"("helcimCustomerCode");

-- AddForeignKey
ALTER TABLE "UnpaidAmount" ADD CONSTRAINT "UnpaidAmount_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceReminder" ADD CONSTRAINT "InvoiceReminder_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackMessage" ADD CONSTRAINT "FeedbackMessage_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "Feedback"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackMessage" ADD CONSTRAINT "FeedbackMessage_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentAgreement" ADD CONSTRAINT "PaymentAgreement_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

