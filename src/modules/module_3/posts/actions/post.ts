"use server";

import { revalidatePath } from "next/cache";
import { createPost, getPosts, getPostsByUser, UnifiedPost } from "@module_3/posts/services/supabase-service";
import { 
  getUserMainCommunities, 
  getCommunityBySlug,
  isUserSubscribed 
} from "@module_2/communities/exports";
import { createClient } from "@/lib/db/server";

export interface CommunityOption {
  id: string;
  name: string;
}

export async function getPostsByUserAction(userId: string): Promise<UnifiedPost[]> {
  try {
    if (!userId) throw new Error("El userId es requerido");
    return await getPostsByUser(userId);
  } catch (error) {
    console.error("Error obteniendo los posts del usuario:", error);
    return [];
  }
}

export async function getUserJoinedCommunitiesAction(): Promise<CommunityOption[]> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const mainCommunities = await getUserMainCommunities(user.id);

    return (mainCommunities || []).map((community: any) => ({
      id: community.id,
      name: community.name,
    }));
  } catch (error) {
    console.error("Error al obtener las comunidades del usuario:", error);

    try {
      const generalCommunity = await getCommunityBySlug("temas-generales");
      if (generalCommunity) {
        return [{ id: generalCommunity.id, name: generalCommunity.name }];
      }
    } catch (fallbackError) {
      console.error("Error al buscar la comunidad General:", fallbackError);
    }

    return [];
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

    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const hasMembership = await isUserSubscribed(user.id, payload.communityId);
        if (!hasMembership) {
          return { 
            success: false, 
            error: "Debes estar suscrito a esta comunidad para poder publicar en ella." 
          };
        }
      }
    } catch (subError) {
      console.warn("Validación de membresía ignorada en dev:", subError);
    }

    const result = await createPost(payload);

    if (result.success) {
      revalidatePath("/");
    }
    return result;
  } catch (error) {
    console.error("Error en createPostAction:", error);
    return { success: false, error: "Error interno al conectar con la base de datos." };
  }
}

export async function getPostsAction(filter?: string): Promise<UnifiedPost[]> {
  try {
    return await getPosts(filter);
  } catch (error) {
    console.error("Error en getPostsAction:", error);
    return [];
  }
}