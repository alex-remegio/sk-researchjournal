import { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { withAuth } from "@/lib/api/guard";
import { replaceReferences } from "@/lib/services/articles";
import { z } from "zod";
import { isValidDoi } from "@/lib/identifiers";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  return withAuth(request, async ({ user, meta }) => {
    const { references } = z
      .object({
        references: z.array(
          z.object({
            referenceText: z.string().min(5).max(4000),
            doi: z
              .string()
              .nullable()
              .optional()
              .refine((value) => !value || isValidDoi(value), "Invalid DOI"),
            url: z.string().url().nullable().optional(),
          }),
        ),
      })
      .parse(await request.json());
    const article = await replaceReferences(id, references, user, meta);
    return json({ article });
  });
}
