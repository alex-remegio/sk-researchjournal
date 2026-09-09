-- Accepted articles move onto the publication pipeline.
UPDATE "articles"
SET "status" = 'READY_FOR_PUBLICATION'
WHERE "status" IN ('FOR_APPROVAL', 'APPROVED')
  AND "deleted_at" IS NULL;
