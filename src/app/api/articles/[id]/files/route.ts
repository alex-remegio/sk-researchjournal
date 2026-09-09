import { NextRequest } from "next/server";
import { FileType } from "@prisma/client";
import { json } from "@/lib/http";
import { withAuth } from "@/lib/api/guard";
import { uploadArticleFile } from "@/lib/services/files";
import { AppError } from "@/lib/errors";
import { fileTypeSchema } from "@/lib/validation/schemas";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  return withAuth(request, async ({ user, meta }) => {
    const form = await request.formData();
    const file = form.get("file");
    const fileType = fileTypeSchema.parse(form.get("fileType"));
    if (!(file instanceof File)) throw new AppError("File is required");
    const buffer = Buffer.from(await file.arrayBuffer());
    const record = await uploadArticleFile({
      articleId: id,
      fileType: fileType as FileType,
      buffer,
      originalName: file.name,
      declaredMime: file.type,
      actor: user,
      requestMeta: meta,
    });
    return json({ file: record }, 201);
  });
}
