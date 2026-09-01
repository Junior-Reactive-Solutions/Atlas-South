-- Server-side consent audit trail + system/error log.
--
-- ConsentLog exists because UK GDPR Art. 7(1) puts the burden of demonstrating consent on
-- the controller, and a choice stored only in the visitor's own browser cannot be produced
-- as evidence. It holds no IP, user agent or page path — see the schema comments for why
-- a log covering people who may have refused is kept deliberately non-identifying.

CREATE TYPE "SystemEventLevel" AS ENUM ('info', 'warning', 'error');

CREATE TABLE "ConsentLog" (
    "id" TEXT NOT NULL,
    "consentId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "choices" JSONB NOT NULL,
    "decidedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsentLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ConsentLog_consentId_idx" ON "ConsentLog"("consentId");
CREATE INDEX "ConsentLog_createdAt_idx" ON "ConsentLog"("createdAt");

CREATE TABLE "SystemEvent" (
    "id" TEXT NOT NULL,
    "level" "SystemEventLevel" NOT NULL DEFAULT 'error',
    "source" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "path" TEXT,
    "context" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SystemEvent_level_createdAt_idx" ON "SystemEvent"("level", "createdAt");
CREATE INDEX "SystemEvent_createdAt_idx" ON "SystemEvent"("createdAt");
