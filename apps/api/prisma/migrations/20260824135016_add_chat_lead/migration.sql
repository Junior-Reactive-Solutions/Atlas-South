-- CreateTable
CREATE TABLE "ChatLead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "services" TEXT NOT NULL,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatLead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChatLead_createdAt_idx" ON "ChatLead"("createdAt");

-- CreateIndex
CREATE INDEX "ChatLead_email_idx" ON "ChatLead"("email");
