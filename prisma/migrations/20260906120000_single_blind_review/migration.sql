-- CreateEnum
CREATE TYPE "ReviewAssignmentStatus" AS ENUM ('INVITED', 'ACCEPTED', 'DECLINED', 'COMPLETED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "ReviewRecommendation" AS ENUM ('ACCEPT', 'MINOR_REVISION', 'MAJOR_REVISION', 'REJECT');

-- CreateEnum
CREATE TYPE "EditorialDecisionType" AS ENUM ('SEND_TO_REVIEW', 'DESK_REJECT', 'ACCEPT', 'MINOR_REVISION', 'MAJOR_REVISION', 'REJECT');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ArticleStatus" ADD VALUE 'SUBMITTED';
ALTER TYPE "ArticleStatus" ADD VALUE 'REVISION_REQUIRED';
ALTER TYPE "ArticleStatus" ADD VALUE 'REVISED';
ALTER TYPE "ArticleStatus" ADD VALUE 'REJECTED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'SCREEN';
ALTER TYPE "AuditAction" ADD VALUE 'ASSIGN_REVIEWER';
ALTER TYPE "AuditAction" ADD VALUE 'SUBMIT_REVIEW';
ALTER TYPE "AuditAction" ADD VALUE 'EDITORIAL_DECISION';
ALTER TYPE "AuditAction" ADD VALUE 'SUBMIT_REVISION';

-- AlterEnum
ALTER TYPE "FileType" ADD VALUE 'MANUSCRIPT';

-- CreateTable
CREATE TABLE "ReviewRound" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "roundNumber" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ReviewRound_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewAssignment" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "assignedById" TEXT NOT NULL,
    "status" "ReviewAssignmentStatus" NOT NULL DEFAULT 'INVITED',
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "conflictDeclared" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReviewAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewReport" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "recommendation" "ReviewRecommendation" NOT NULL,
    "originality" TEXT NOT NULL,
    "significance" TEXT NOT NULL,
    "methodology" TEXT NOT NULL,
    "clarity" TEXT NOT NULL,
    "commentsToAuthor" TEXT NOT NULL,
    "commentsToEditor" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EditorialDecision" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "roundId" TEXT,
    "decidedById" TEXT NOT NULL,
    "decision" "EditorialDecisionType" NOT NULL,
    "letterToAuthors" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EditorialDecision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthorRevision" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "responseToReviewers" TEXT NOT NULL,
    "submittedById" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthorRevision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReviewRound_articleId_idx" ON "ReviewRound"("articleId");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewRound_articleId_roundNumber_key" ON "ReviewRound"("articleId", "roundNumber");

-- CreateIndex
CREATE INDEX "ReviewAssignment_reviewerId_status_idx" ON "ReviewAssignment"("reviewerId", "status");

-- CreateIndex
CREATE INDEX "ReviewAssignment_articleId_idx" ON "ReviewAssignment"("articleId");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewAssignment_roundId_reviewerId_key" ON "ReviewAssignment"("roundId", "reviewerId");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewReport_assignmentId_key" ON "ReviewReport"("assignmentId");

-- CreateIndex
CREATE INDEX "ReviewReport_articleId_roundId_idx" ON "ReviewReport"("articleId", "roundId");

-- CreateIndex
CREATE INDEX "EditorialDecision_articleId_createdAt_idx" ON "EditorialDecision"("articleId", "createdAt");

-- CreateIndex
CREATE INDEX "AuthorRevision_articleId_submittedAt_idx" ON "AuthorRevision"("articleId", "submittedAt");

-- AddForeignKey
ALTER TABLE "ReviewRound" ADD CONSTRAINT "ReviewRound_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewAssignment" ADD CONSTRAINT "ReviewAssignment_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewAssignment" ADD CONSTRAINT "ReviewAssignment_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "ReviewRound"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewAssignment" ADD CONSTRAINT "ReviewAssignment_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewAssignment" ADD CONSTRAINT "ReviewAssignment_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewReport" ADD CONSTRAINT "ReviewReport_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "ReviewAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewReport" ADD CONSTRAINT "ReviewReport_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewReport" ADD CONSTRAINT "ReviewReport_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "ReviewRound"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewReport" ADD CONSTRAINT "ReviewReport_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditorialDecision" ADD CONSTRAINT "EditorialDecision_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditorialDecision" ADD CONSTRAINT "EditorialDecision_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "ReviewRound"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditorialDecision" ADD CONSTRAINT "EditorialDecision_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthorRevision" ADD CONSTRAINT "AuthorRevision_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthorRevision" ADD CONSTRAINT "AuthorRevision_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "ReviewRound"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthorRevision" ADD CONSTRAINT "AuthorRevision_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

