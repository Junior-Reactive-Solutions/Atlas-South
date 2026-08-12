-- CreateTable
CREATE TABLE "PageVisibility" (
    "navId" TEXT NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageVisibility_pkey" PRIMARY KEY ("navId")
);

-- CreateIndex
CREATE INDEX "PageVisibility_visible_idx" ON "PageVisibility"("visible");
