import { createClient } from "@/lib/db/server";
import { User } from "@/lib/types";
import { verifyModeratorPermission } from "../utils/role-verification.util";

export async function updatePostPinStatus(post_id: string, is_pinned: boolean, moderator: User): Promise<void> {
  const auth = verifyModeratorPermission(moderator);
  if (!auth.isAuthorized) throw new Error(auth.reason);

  const supabase = await createClient();
  const { error } = await supabase
    .from("posts")
    .update({ is_pinned })
    .eq("id", post_id);

  if (error) throw new Error(`Failed to update pin status: ${error.message}`);
}

export async function updatePostSolvedStatus(post_id: string, is_solved: boolean, moderator: User): Promise<void> {
  const auth = verifyModeratorPermission(moderator);
  if (!auth.isAuthorized) throw new Error(auth.reason);

  const supabase = await createClient();
  const newStatus = is_solved ? "closed" : "open";

  const { error } = await supabase
    .from("posts")
    .update({ status: newStatus })
    .eq("id", post_id);

  if (error) throw new Error(`Failed to update solved status: ${error.message}`);
}