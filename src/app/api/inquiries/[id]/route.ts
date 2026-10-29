import { NextResponse } from "next/server";
import { requireStaffApi } from "@/lib/auth/staff-api";
import { getSupabaseServiceRoleKey, isSupabaseEnabled } from "@/lib/supabase/env";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ id: string }> };

/** Staff: permanently delete an inquiry (and clear related proposal links via DB). */
export async function DELETE(_request: Request, { params }: Params) {
  if (!(await requireStaffApi())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  if (!isSupabaseEnabled() || !getSupabaseServiceRoleKey()) {
    return NextResponse.json({ error: "Supabase is not enabled." }, { status: 503 });
  }

  const { id } = await params;
  if (!id?.trim()) {
    return NextResponse.json({ error: "Missing inquiry id." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("inquiries").delete().eq("id", id.trim());

  if (error) {
    return NextResponse.json({ error: "Could not delete the inquiry." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
