'use server';

import { createClient } from "@/lib/db/server";
import { revalidatePath } from "next/cache";
import { updateContentVisibility, updateReportsStatus } from "@module_5/reports/exports";
import { TargetType } from "@/lib/types/report";
import { User } from "@/lib/types";

export async function moderateReportAction(
  target_id: string,
  target_type: TargetType,
  action: "approve" | "reject"
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("No autenticado.");
  }

  const { data: userRec } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  const moderator = userRec as User;

  if (!moderator || !["moderator", "admin"].includes(moderator.role)) {
    throw new Error("No autorizado.");
  }

  if (action === "approve") {
    await updateContentVisibility(target_id, target_type, moderator);
  } else {
    await updateReportsStatus(target_id, target_type, moderator);
  }

  revalidatePath('/');
  revalidatePath('/moderation');
}