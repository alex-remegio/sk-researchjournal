import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getStorage } from "@/lib/storage";
import { assertSafeStorageKey } from "@/lib/storage/file-validation";
import { getSessionFromRequest } from "@/lib/auth/session";
import { errorResponse } from "@/lib/http";
import { NotFoundError, ForbiddenError } from "@/lib/errors";

type Params = { params: Promise<{ key: string[] }> };

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { key: parts } = await params;
    const key = parts.map((part) => decodeURIComponent(part)).join("/");
    assertSafeStorageKey(key);
    const file = await prisma.articleFile.findUnique({
      where: { storageKey: key },
      include: { article: true },
    });
    if (!file) throw new NotFoundError("File not found");
    if (file.article.status !== "PUBLISHED") {
      const user = await getSessionFromRequest(request);
      if (!user) throw new ForbiddenError();
    }
    const stored = await getStorage().get(key);
    if (!stored) throw new NotFoundError("File not found");
    return new NextResponse(new Uint8Array(stored.body), {
      headers: {
        "Content-Type": file.mimeType,
        "Content-Disposition": `${file.fileType === "FINAL_PDF" ? "inline" : "attachment"}; filename="${file.originalName}"`,
        "Cache-Control": file.article.status === "PUBLISHED" ? "public, max-age=3600" : "private",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
