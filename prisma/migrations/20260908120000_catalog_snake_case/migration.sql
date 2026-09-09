-- Catalog tables and columns match the publishing ERD (snake_case).
-- Data is preserved via RENAME; supporting editorial tables stay as they are.

ALTER TABLE "User" RENAME COLUMN "passwordHash" TO "password_hash";
ALTER TABLE "User" RENAME COLUMN "deletedAt" TO "deleted_at";
ALTER TABLE "User" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "User" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "User" RENAME TO "users";

ALTER TABLE "Author" RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "Author" RENAME COLUMN "firstName" TO "first_name";
ALTER TABLE "Author" RENAME COLUMN "middleName" TO "middle_name";
ALTER TABLE "Author" RENAME COLUMN "lastName" TO "last_name";
ALTER TABLE "Author" RENAME COLUMN "deletedAt" TO "deleted_at";
ALTER TABLE "Author" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "Author" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "Author" RENAME TO "authors";

ALTER TABLE "Journal" RENAME COLUMN "issnPrint" TO "issn_print";
ALTER TABLE "Journal" RENAME COLUMN "issnOnline" TO "issn_online";
ALTER TABLE "Journal" RENAME COLUMN "logoUrl" TO "logo_url";
ALTER TABLE "Journal" RENAME COLUMN "coverUrl" TO "cover_url";
ALTER TABLE "Journal" RENAME COLUMN "websiteSlug" TO "website_slug";
ALTER TABLE "Journal" RENAME COLUMN "deletedAt" TO "deleted_at";
ALTER TABLE "Journal" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "Journal" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "Journal" RENAME TO "journals";

ALTER TABLE "Issue" RENAME COLUMN "journalId" TO "journal_id";
ALTER TABLE "Issue" RENAME COLUMN "issueNumber" TO "issue_number";
ALTER TABLE "Issue" RENAME COLUMN "publicationDate" TO "publication_date";
ALTER TABLE "Issue" RENAME COLUMN "coverUrl" TO "cover_url";
ALTER TABLE "Issue" RENAME COLUMN "deletedAt" TO "deleted_at";
ALTER TABLE "Issue" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "Issue" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "Issue" RENAME TO "issues";

ALTER TABLE "Article" RENAME COLUMN "articleType" TO "article_type";
ALTER TABLE "Article" RENAME COLUMN "categoryId" TO "category_id";
ALTER TABLE "Article" RENAME COLUMN "journalId" TO "journal_id";
ALTER TABLE "Article" RENAME COLUMN "issueId" TO "issue_id";
ALTER TABLE "Article" RENAME COLUMN "firstPage" TO "first_page";
ALTER TABLE "Article" RENAME COLUMN "lastPage" TO "last_page";
ALTER TABLE "Article" RENAME COLUMN "publicationDate" TO "publication_date";
ALTER TABLE "Article" RENAME COLUMN "pdfUrl" TO "pdf_url";
ALTER TABLE "Article" RENAME COLUMN "thumbnailUrl" TO "thumbnail_url";
ALTER TABLE "Article" RENAME COLUMN "edasPaperId" TO "edas_paper_id";
ALTER TABLE "Article" RENAME COLUMN "createdById" TO "created_by_id";
ALTER TABLE "Article" RENAME COLUMN "approvedById" TO "approved_by_id";
ALTER TABLE "Article" RENAME COLUMN "approvedAt" TO "approved_at";
ALTER TABLE "Article" RENAME COLUMN "publishedAt" TO "published_at";
ALTER TABLE "Article" RENAME COLUMN "deletedAt" TO "deleted_at";
ALTER TABLE "Article" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "Article" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "Article" RENAME TO "articles";

ALTER TABLE "ArticleAuthor" RENAME COLUMN "articleId" TO "article_id";
ALTER TABLE "ArticleAuthor" RENAME COLUMN "authorId" TO "author_id";
ALTER TABLE "ArticleAuthor" RENAME COLUMN "authorOrder" TO "author_order";
ALTER TABLE "ArticleAuthor" RENAME COLUMN "affiliationText" TO "affiliation_text";
ALTER TABLE "ArticleAuthor" RENAME TO "article_authors";

ALTER TABLE "Keyword" RENAME COLUMN "articleId" TO "article_id";
ALTER TABLE "Keyword" RENAME COLUMN "sortOrder" TO "sort_order";
ALTER TABLE "Keyword" RENAME TO "keywords";

ALTER TABLE "Reference" RENAME COLUMN "articleId" TO "article_id";
ALTER TABLE "Reference" RENAME COLUMN "referenceText" TO "reference_text";
ALTER TABLE "Reference" RENAME COLUMN "referenceOrder" TO "reference_order";
ALTER TABLE "Reference" RENAME TO "references";
