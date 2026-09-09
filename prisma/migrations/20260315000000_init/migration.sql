-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'EDITOR_IN_CHIEF', 'MANAGING_EDITOR', 'SECTION_EDITOR', 'AUTHOR', 'REVIEWER', 'READER');

-- CreateEnum
CREATE TYPE "ArticleStatus" AS ENUM ('DRAFT', 'FOR_REVIEW', 'FOR_APPROVAL', 'APPROVED', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "IssueStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ArticleType" AS ENUM ('RESEARCH', 'REVIEW', 'SHORT_COMMUNICATION', 'EDITORIAL', 'CASE_STUDY', 'TECHNICAL_NOTE');

-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('FINAL_PDF', 'SUPPLEMENTARY', 'THUMBNAIL');

-- CreateEnum
CREATE TYPE "MetricType" AS ENUM ('PAGE_VIEW', 'PDF_DOWNLOAD');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('LOGIN', 'LOGOUT', 'LOGIN_FAILED', 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'PUBLISH', 'UNPUBLISH', 'ARCHIVE', 'ROLE_CHANGE', 'SETTINGS_UPDATE', 'FILE_UPLOAD', 'FILE_DELETE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'READER',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Author" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "affiliation" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "orcid" TEXT,
    "biography" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Author_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthorAffiliation" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT,
    "department" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AuthorAffiliation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Journal" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "issnPrint" TEXT,
    "issnOnline" TEXT,
    "publisher" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "logoUrl" TEXT,
    "coverUrl" TEXT,
    "websiteSlug" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Journal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Issue" (
    "id" TEXT NOT NULL,
    "journalId" TEXT NOT NULL,
    "volume" INTEGER NOT NULL,
    "issueNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "publicationDate" TIMESTAMP(3),
    "coverUrl" TEXT,
    "status" "IssueStatus" NOT NULL DEFAULT 'DRAFT',
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Issue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "journalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "parentId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "abstract" TEXT NOT NULL,
    "articleType" "ArticleType" NOT NULL DEFAULT 'RESEARCH',
    "categoryId" TEXT,
    "doi" TEXT,
    "journalId" TEXT NOT NULL,
    "issueId" TEXT,
    "firstPage" TEXT,
    "lastPage" TEXT,
    "publicationDate" TIMESTAMP(3),
    "pdfUrl" TEXT,
    "thumbnailUrl" TEXT,
    "status" "ArticleStatus" NOT NULL DEFAULT 'DRAFT',
    "edasPaperId" TEXT,
    "createdById" TEXT NOT NULL,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleAuthor" (
    "articleId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "authorOrder" INTEGER NOT NULL,
    "corresponding" BOOLEAN NOT NULL DEFAULT false,
    "affiliationText" TEXT,

    CONSTRAINT "ArticleAuthor_pkey" PRIMARY KEY ("articleId","authorId")
);

-- CreateTable
CREATE TABLE "Keyword" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Keyword_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reference" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "referenceText" TEXT NOT NULL,
    "doi" TEXT,
    "url" TEXT,
    "referenceOrder" INTEGER NOT NULL,

    CONSTRAINT "Reference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleFile" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "fileType" "FileType" NOT NULL,
    "originalName" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "publicUrl" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArticleFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleMetric" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "metricType" "MetricType" NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArticleMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetricSession" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "metricType" "MetricType" NOT NULL,
    "sessionHash" TEXT NOT NULL,
    "lastRecordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MetricSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "journalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EditorialBoardMember" (
    "id" TEXT NOT NULL,
    "journalId" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "affiliation" TEXT NOT NULL,
    "email" TEXT,
    "orcid" TEXT,
    "photoUrl" TEXT,
    "biography" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EditorialBoardMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalUserAssignment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "journalId" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "categoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JournalUserAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalSetting" (
    "id" TEXT NOT NULL,
    "journalId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JournalSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" "AuditAction" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_active_idx" ON "User"("role", "active");

-- CreateIndex
CREATE UNIQUE INDEX "Author_userId_key" ON "Author"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Author_orcid_key" ON "Author"("orcid");

-- CreateIndex
CREATE INDEX "Author_lastName_firstName_idx" ON "Author"("lastName", "firstName");

-- CreateIndex
CREATE INDEX "Author_email_idx" ON "Author"("email");

-- CreateIndex
CREATE INDEX "AuthorAffiliation_authorId_idx" ON "AuthorAffiliation"("authorId");

-- CreateIndex
CREATE UNIQUE INDEX "Journal_websiteSlug_key" ON "Journal"("websiteSlug");

-- CreateIndex
CREATE INDEX "Journal_active_idx" ON "Journal"("active");

-- CreateIndex
CREATE INDEX "Issue_journalId_year_idx" ON "Issue"("journalId", "year");

-- CreateIndex
CREATE INDEX "Issue_status_idx" ON "Issue"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Issue_journalId_volume_issueNumber_year_key" ON "Issue"("journalId", "volume", "issueNumber", "year");

-- CreateIndex
CREATE INDEX "Category_journalId_idx" ON "Category"("journalId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_journalId_slug_key" ON "Category"("journalId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Article_doi_key" ON "Article"("doi");

-- CreateIndex
CREATE INDEX "Article_status_publishedAt_idx" ON "Article"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "Article_journalId_status_idx" ON "Article"("journalId", "status");

-- CreateIndex
CREATE INDEX "Article_issueId_idx" ON "Article"("issueId");

-- CreateIndex
CREATE INDEX "Article_categoryId_idx" ON "Article"("categoryId");

-- CreateIndex
CREATE INDEX "Article_edasPaperId_idx" ON "Article"("edasPaperId");

-- CreateIndex
CREATE INDEX "Article_createdById_idx" ON "Article"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "Article_journalId_slug_key" ON "Article"("journalId", "slug");

-- CreateIndex
CREATE INDEX "ArticleAuthor_authorId_idx" ON "ArticleAuthor"("authorId");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleAuthor_articleId_authorOrder_key" ON "ArticleAuthor"("articleId", "authorOrder");

-- CreateIndex
CREATE INDEX "Keyword_keyword_idx" ON "Keyword"("keyword");

-- CreateIndex
CREATE UNIQUE INDEX "Keyword_articleId_keyword_key" ON "Keyword"("articleId", "keyword");

-- CreateIndex
CREATE INDEX "Reference_articleId_idx" ON "Reference"("articleId");

-- CreateIndex
CREATE UNIQUE INDEX "Reference_articleId_referenceOrder_key" ON "Reference"("articleId", "referenceOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleFile_storageKey_key" ON "ArticleFile"("storageKey");

-- CreateIndex
CREATE INDEX "ArticleFile_articleId_fileType_idx" ON "ArticleFile"("articleId", "fileType");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleMetric_articleId_metricType_key" ON "ArticleMetric"("articleId", "metricType");

-- CreateIndex
CREATE INDEX "MetricSession_lastRecordedAt_idx" ON "MetricSession"("lastRecordedAt");

-- CreateIndex
CREATE UNIQUE INDEX "MetricSession_articleId_metricType_sessionHash_key" ON "MetricSession"("articleId", "metricType", "sessionHash");

-- CreateIndex
CREATE INDEX "Announcement_journalId_active_publishedAt_idx" ON "Announcement"("journalId", "active", "publishedAt");

-- CreateIndex
CREATE INDEX "EditorialBoardMember_journalId_sortOrder_idx" ON "EditorialBoardMember"("journalId", "sortOrder");

-- CreateIndex
CREATE INDEX "JournalUserAssignment_journalId_role_idx" ON "JournalUserAssignment"("journalId", "role");

-- CreateIndex
CREATE INDEX "JournalUserAssignment_userId_idx" ON "JournalUserAssignment"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "JournalUserAssignment_userId_journalId_role_categoryId_key" ON "JournalUserAssignment"("userId", "journalId", "role", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "JournalSetting_journalId_key_key" ON "JournalSetting"("journalId", "key");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_action_createdAt_idx" ON "AuditLog"("action", "createdAt");

-- AddForeignKey
ALTER TABLE "Author" ADD CONSTRAINT "Author_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthorAffiliation" ADD CONSTRAINT "AuthorAffiliation_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "Journal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "Journal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "Journal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleAuthor" ADD CONSTRAINT "ArticleAuthor_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleAuthor" ADD CONSTRAINT "ArticleAuthor_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Keyword" ADD CONSTRAINT "Keyword_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reference" ADD CONSTRAINT "Reference_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleFile" ADD CONSTRAINT "ArticleFile_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleFile" ADD CONSTRAINT "ArticleFile_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleMetric" ADD CONSTRAINT "ArticleMetric_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetricSession" ADD CONSTRAINT "MetricSession_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "Journal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditorialBoardMember" ADD CONSTRAINT "EditorialBoardMember_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "Journal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditorialBoardMember" ADD CONSTRAINT "EditorialBoardMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalUserAssignment" ADD CONSTRAINT "JournalUserAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalUserAssignment" ADD CONSTRAINT "JournalUserAssignment_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "Journal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalUserAssignment" ADD CONSTRAINT "JournalUserAssignment_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalSetting" ADD CONSTRAINT "JournalSetting_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "Journal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- Full-text search support for published article discovery
CREATE INDEX "Article_search_idx" ON "Article" USING GIN (
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(abstract, '') || ' ' || coalesce(doi, ''))
);
