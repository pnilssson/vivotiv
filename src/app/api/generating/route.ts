import { getGeneratingQuery } from "@/db/queries";
import { getUserOrRedirect } from "@/lib/server-utils";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

export async function GET(_: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await getUserOrRedirect(supabase);
    const generating = await getGeneratingQuery(user.id);
    return NextResponse.json({ generating: !!generating });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      { error: "Failed to get generating state." },
      { status: 500 }
    );
  }
}
