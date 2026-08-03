import { createClient } from "@/lib/db/server";
import { User } from "@/lib/types";
import { Warning } from "@/lib/types/warning";
import { verifyModeratorPermission } from "@module_5/moderation/exports";

const WARNING_LIMIT = 3; 

export async function createWarning(
  userId: string, 
  moderator: User, 
  type: string, 
  reason: string, 
  expiresAt: string
): Promise<void> {
  const auth = verifyModeratorPermission(moderator);
  if (!auth.isAuthorized) throw new Error(auth.reason);

  const supabase = await createClient();
  const { error } = await supabase
    .from("warnings")
    .insert({
      user_id: userId,
      moderator_id: moderator.id,
      type,
      reason,
      expires_at: expiresAt
    });

  if (error) throw new Error(`Failed to create warning: ${error.message}`);
}

export async function getActiveUserWarnings(userId: string): Promise<Warning[]> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("warnings")
    .select("*")
    .eq("user_id", userId)
    .gt("expires_at", now);

  if (error) throw new Error(`Failed to fetch user warnings: ${error.message}`);
  return data as Warning[];
}

export async function getUserPostingPermission(userId: string): Promise<boolean> {
  const activeWarnings = await getActiveUserWarnings(userId);
  return activeWarnings.length < WARNING_LIMIT;
}