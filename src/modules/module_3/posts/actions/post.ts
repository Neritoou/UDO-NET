"use server";

import { revalidatePath } from "next/cache";
import { getLinkMetadata } from "@module_3/posts/actions/links"; 
import { mockPosts, MockPost, getRandomUserProfile } from "@module_3/posts/services/mock-data"; 
import { PostServiceFactory } from "@module_3/posts/services/factory";
import fs from "fs/promises";
import path from "path";

interface ActionResponse {
  success: boolean;
  message?: string;
  error?: string;
}

const MAX_FILE_SIZE = 4194304; // 4MB en Bytes
const JSON_FILE_PATH = path.join(process.cwd(), "src", "modules", "module_3", "posts", "services", "mock-posts-extra.json");

export async function createPostAction(formData: FormData): Promise<ActionResponse> {
  try {
    const postText = (formData.get("postText") as string) || "";
    const detectedUrl = (formData.get("detectedUrl") as string) || "";
    const tagsInput = (formData.get("tags") as string) || "";
    const file = formData.get("file") as File | null;

    // 1. Validaciones básicas
    if (!postText.trim()) {
      return { success: false, error: "El texto del post no puede estar vacío." };
    }

    // 2. Validación de tags obligatorios
    if (!tagsInput.trim()) {
      return { success: false, error: "Es obligatorio ingresar al menos un tag." };
    }

    const tagsArray = tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    if (tagsArray.length === 0) {
      return { success: false, error: "Formato de tags inválido. Usa comas para separar." };
    }

    // Procesamiento de archivos
    if (file && file.size > 0) {
      if (file.size > MAX_FILE_SIZE) {
        return { success: false, error: "El archivo excede el tamaño máximo de 4MB." };
      }
    }

    // Obtención de metadatos de URL
    let finalMetadata = null;
    if (detectedUrl) {
      const metaResult = await getLinkMetadata(detectedUrl);
      if (metaResult.success === 1 && metaResult.meta) {
        finalMetadata = metaResult.meta;
      }
    }

    const authorProfile = await getRandomUserProfile();

    // Estructura completa guardando Links y Metadata
    const newPost: MockPost = {
      id: `post_${crypto.randomUUID().substring(0, 8)}`,
      title: postText.substring(0, 40) + (postText.length > 40 ? "..." : ""), 
      content: postText,
      community: "General", 
      tags: tagsArray, 
      author: { username: authorProfile.username },
      createdAt: new Date(),
      votes: 0,
      repliesCount: 0,
      status: "Abierto" as const,
      replies: [],
      links: detectedUrl ? [detectedUrl] : [], // Almacenado como array en links
      linkMetadata: finalMetadata            // Guardamos la miniatura scrapeada
    };

    // Persistencia en JSON
    let extraPosts: MockPost[] = [];
    try {
      const contenidoJson = await fs.readFile(JSON_FILE_PATH, "utf-8");
      extraPosts = JSON.parse(contenidoJson);
    } catch (readError) {
      const err = readError as { code?: string };
      if (err.code !== "ENOENT") throw readError;
    }

    extraPosts.push(newPost);
    await fs.writeFile(JSON_FILE_PATH, JSON.stringify(extraPosts, null, 2), "utf-8");

    // Sincronización en memoria y Revalidación de Next.js
    mockPosts.push(newPost);
    revalidatePath("/"); 

    return { success: true, message: "Post creado correctamente." };

  } catch (error) {
    console.error("Error en createPostAction:", error);
    return { success: false, error: "Error interno en el servidor." };
  }
}

export async function getPostsAction(filter?: string): Promise<MockPost[]> {
  try {
    const service = PostServiceFactory.getService();
    return await service.getPosts(filter);
  } catch (error) {
    console.error("Error en getPostsAction:", error);
    return [];
  }
}