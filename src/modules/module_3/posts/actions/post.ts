"use server";

import { revalidatePath } from "next/cache";
import { createPost, getPosts, getPostsByUser, UnifiedPost } from "@module_3/posts/services/post.service";
import { getLinkMetadata } from "./links";
import { Community } from "@/lib/types";
import { 
  getUserMainCommunities, 
  getCommunityBySlug,
  isUserSubscribed 
} from "@module_2/communities/exports";
import { getCurrentUser, getCurrentUserId } from "@module_1/auth/exports";

export interface CommunityOption {
  id: string;
  name: string;
}

export async function getPostsByUserAction(userId: string): Promise<UnifiedPost[]> {
  try {
    if (!userId) throw new Error("El userId es requerido");
    return await getPostsByUser(userId);
  } catch (error) {
    return [];
  }
}

export async function getUserJoinedCommunitiesAction(): Promise<CommunityOption[]> {
  try {
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) return [];

    const mainCommunities = await getUserMainCommunities(currentUserId);

    return (mainCommunities || []).map((community: Community) => ({
      id: community.id,
      name: community.name,
    }));
  } catch (error) {
    try {
      const generalCommunity = await getCommunityBySlug("temas-generales");
      if (generalCommunity) {
        return [{ id: generalCommunity.id, name: generalCommunity.name }];
      }
    } catch (fallbackError) {
    }

    return [{ id: "00000000-0000-0000-0000-000000000002", name: "General" }];
  }
}

export interface CurrentUserDisplay {
  username: string;
  avatarUrl: string | null;
}

/** Devuelve los datos del usuario autenticado que necesita el modal de creación de posts. */
export async function getCurrentUserDisplayAction(): Promise<CurrentUserDisplay | null> {
  try {
    const user = await getCurrentUser();
    if (!user) return null;
    return { username: user.username, avatarUrl: user.avatar_url ?? null };
  } catch (error) {
    return null;
  }
}

export async function createPostAction(formData: FormData | {
  title: string;
  content: string;
  communityId: string;
  tags?: string[];
  links?: string[];
}) {
  try {
    let payload: {
      title: string;
      content: string;
      communityId: string;
      tags?: string[];
      links?: string[];
    };

    if (formData instanceof FormData) {
      const title = formData.get("title") as string;
      const content = (formData.get("postText") as string) || (formData.get("content") as string) || "";
      const communityId = formData.get("communityId") as string;
      const tagsStr = formData.get("tags") as string;
      const tags = tagsStr ? tagsStr.split(",").map(t => t.trim().replace("#", "")) : [];
      const link = formData.get("detectedUrl") as string;
      const links = link ? [link] : [];

      payload = { title, content, communityId, tags, links };
    } else {
      payload = formData;
    }

    if (!payload.title || !payload.title.trim()) {
      return { success: false, error: "El título es obligatorio." };
    }

    if (!payload.communityId) {
      return { success: false, error: "Debes seleccionar una comunidad." };
    }

    const currentUserId = await getCurrentUserId();
    if (!currentUserId) {
      return { success: false, error: "Debes iniciar sesión para publicar." };
    }

    try {
      const hasMembership = await isUserSubscribed(currentUserId, payload.communityId);
      if (!hasMembership) {
        return { 
          success: false, 
          error: "Debes estar suscrito a esta comunidad para poder publicar en ella." 
        };
      }
    } catch (subError) {
    }

    let linkMetadata: { title?: string | null; description?: string | null; image_url?: string | null } | undefined = undefined;
    const detectedUrl = payload.links && payload.links.length > 0 ? payload.links[0] : undefined;

    if (detectedUrl) {
      try {
        const metaRes = (await getLinkMetadata(detectedUrl)) as { success: number; meta?: { title?: string; description?: string; image?: { url?: string } } };
        if (metaRes.success === 1 && metaRes.meta) {
          linkMetadata = {
            title: metaRes.meta.title || null,
            description: metaRes.meta.description || null,
            image_url: metaRes.meta.image?.url || null,
          };
        }
      } catch (e) {
        // metadata fetch failure ignored
      }
    }

    const result = await createPost({
      ...payload,
      detectedUrl,
      linkMetadata,
    });

    if (result.success) {
      revalidatePath("/");
    }
    return result;
  } catch (error) {
    return { success: false, error: "Error interno al conectar con la base de datos." };
  }
}

export async function getPostsAction(filter?: string): Promise<UnifiedPost[]> {
  try {
    return await getPosts(filter);
  } catch (error) {
    return [];
  }
}