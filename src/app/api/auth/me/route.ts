import { json } from "@/lib/http";
import { requireSession } from "@/lib/auth/session";
import { errorResponse } from "@/lib/http";

export async function GET() {
  try {
    const user = await requireSession();
    return json({ user });
  } catch (error) {
    return errorResponse(error);
  }
}
