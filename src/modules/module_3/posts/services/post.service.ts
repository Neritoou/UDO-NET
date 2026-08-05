import { Post, Reply, PostLink, User, Community } from '@/lib/types';
import { createClient } from '@/lib/db/server';
import { buildReplyTree } from './reply.service';

export interface ActionResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export type DatabaseUser = Partial<User> & { id: string; username: string; avatar_url?: string | null };
export type DatabasePostLink = PostLink;

export type DatabaseReply = Reply & {
  author?: DatabaseUser;
  nestedReplies?: DatabaseReply[];
  votes?: { user_id: string; value: number; weight?: number }[];
};

export type UnifiedPost = Omit<Post, 'status'> & {
  status: 'open' | 'closed';
  author: DatabaseUser;
  community?: Community;
  community_name?: string;
  tags: string[];
  links: DatabasePostLink[];
  replies: DatabaseReply[];
  votes_count: number;
  replies_count: number;
};

export type RawPostRow = Post & {
  author?: DatabaseUser;
  communities?: { name: string } | null;
  post_tags?: { tag: { name: string } }[];
  links?: DatabasePostLink[];
  replies?: { id: string }[];
};

export interface CreatePostPayload {
  title: string;
  content?: string;
  communityId?: string;
  community_id?: string;
  tags?: string[];
  links?: string[];
  detectedUrl?: string;
  linkMetadata?: {
    title?: string | null;
    description?: string | null;
    image_url?: string | null;
  };
}

export async function getThread(id: string): Promise<UnifiedPost | null> {
  const supabase = await createClient();

  // EXCEPCIÓN DE ARQUITECTURA / RENDIMIENTO:
  // JOIN cruzado con `users` (Módulo 1) y `communities` (Módulo 2) para evitar N+1 queries.
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:users(id, username, avatar_url, reputation, role),
      communities(name),
      links:post_links(*),
      post_tags(tag:tags(name)),
      replies(*, author:users(id, username, avatar_url, reputation, role), votes(user_id, value, weight))
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  const formattedTags = data.post_tags?.map((pt: { tag: { name: string } }) => pt.tag.name) || [];

  const rawReplies = data.replies || [];
  const processedReplies: DatabaseReply[] = rawReplies.map((r: any) => {
    const votesList = r.votes || [];
    const calculatedVoteCount = votesList.length > 0
      ? votesList.reduce((sum: number, v: { value: number; weight?: number }) => sum + (v.value * (v.weight || 1)), 0)
      : (r.vote_count || 0);

    return {
      ...r,
      vote_count: Math.round(calculatedVoteCount),
      votes: votesList
    };
  });

  const post: UnifiedPost = {
    ...data,
    community_name: data.communities?.name || 'General',
    tags: formattedTags,
    replies_count: rawReplies.length,
    votes_count: 0
  };

  post.replies = buildReplyTree(processedReplies);

  return post;
}

export async function createPost(formData: FormData | CreatePostPayload): Promise<ActionResponse> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Debes iniciar sesión para publicar.' };
  }

  const userId = user.id;

  let title: string;
  let content: string;
  let detectedUrl: string;
  let tagsInput: string;
  let communityId: string;
  let linkMetadata: { title?: string | null; description?: string | null; image_url?: string | null } | undefined;

  if (formData instanceof FormData) {
    title = formData.get("title") as string;
    content = (formData.get("postText") as string) || (formData.get("content") as string) || "";
    detectedUrl = formData.get("detectedUrl") as string;
    tagsInput = formData.get("tags") as string;
    communityId = (formData.get("communityId") as string) || (formData.get("community_id") as string) || "";
  } else {
    title = formData.title;
    content = formData.content || "";
    detectedUrl = formData.detectedUrl || (formData.links && formData.links.length > 0 ? formData.links[0] : "");
    tagsInput = formData.tags ? formData.tags.join(",") : "";
    communityId = formData.communityId || formData.community_id || "";
    linkMetadata = formData.linkMetadata;
  }

  if (!communityId) {
    const { data: defaultComm } = await supabase.from('communities').select('id').limit(1).single();
    if (defaultComm) {
      communityId = defaultComm.id;
    }
  }

  const { data: newPost, error: postError } = await supabase
    .from('posts')
    .insert({
      title,
      content,
      author_id: userId,
      community_id: communityId || null,
      status: 'open',
      // (DiGiorgio-L): When creating a post, the SQL database by default sets the is_private property to true, these lines are meant to change that to allow for passing the RLS check.
      is_private: false,
      is_hidden: false
    })
    .select()
    .single();

  if (postError) {
    return { success: false, error: 'Error al crear la publicación.' };
  }

  if (tagsInput) {
    const tagsArray = tagsInput.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);

    for (const tagName of tagsArray) {
      let { data: existingTag } = await supabase.from('tags').select('id').eq('name', tagName).single();
      let tagId = existingTag?.id;

      if (!tagId) {
        const { data: newTag } = await supabase.from('tags').insert({ name: tagName }).select('id').single();
        tagId = newTag?.id;
      }

      if (tagId) {
        await supabase.from('post_tags').insert({ post_id: newPost.id, tag_id: tagId });
      }
    }
  }

  if (detectedUrl) {
    await supabase.from('post_links').insert({
      post_id: newPost.id,
      url: detectedUrl,
      title: linkMetadata?.title || null,
      description: linkMetadata?.description || null,
      image_url: linkMetadata?.image_url || null
    });
  }

  return { success: true, message: 'Publicación creada con éxito.' };
}

export async function search(term: string = '', community?: string, tags?: string[], filter?: string): Promise<UnifiedPost[]> {
  const supabase = await createClient();

  const cleanTerm = term?.startsWith('#') ? term.slice(1).trim() : term?.trim() || '';

  // EXCEPCIÓN DE ARQUITECTURA / RENDIMIENTO:
  // JOIN cruzado con `users` (Módulo 1) y `communities` (Módulo 2) para evitar N+1 queries.
  let query = supabase
    .from('posts')
    .select(`
      *,
      author:users(id, username, avatar_url, reputation, role),
      communities(name),
      links:post_links(*),
      post_tags(tag:tags(name)),
      replies(id, votes(value, weight))
    `)
    .eq('is_hidden', false);

  if (tags && tags.length > 0) {
    const { data: tagData } = await supabase
      .from('tags')
      .select('id')
      .in('name', tags);

    const tagIds = tagData?.map((t: { id: string }) => t.id) || [];

    if (tagIds.length > 0) {
      const { data: ptData } = await supabase
        .from('post_tags')
        .select('post_id')
        .in('tag_id', tagIds);

      const postIdsFromTags = ptData?.map((pt: { post_id: string }) => pt.post_id) || [];
      if (postIdsFromTags.length > 0) {
        query = query.in('id', postIdsFromTags);
      } else {
        return [];
      }
    } else {
      return [];
    }
  }

  if (cleanTerm) {
    const { data: matchedTags } = await supabase
      .from('tags')
      .select('id')
      .ilike('name', `%${cleanTerm}%`);

    const matchedTagIds = matchedTags?.map((t: { id: string }) => t.id) || [];
    let matchedPostIdsFromTags: string[] = [];

    if (matchedTagIds.length > 0) {
      const { data: ptData } = await supabase
        .from('post_tags')
        .select('post_id')
        .in('tag_id', matchedTagIds);

      matchedPostIdsFromTags = ptData?.map((pt: { post_id: string }) => pt.post_id) || [];
    }

    if (matchedPostIdsFromTags.length > 0) {
      const idList = matchedPostIdsFromTags.join(',');
      query = query.or(`title.ilike.%${cleanTerm}%,content.ilike.%${cleanTerm}%,id.in.(${idList})`);
    } else {
      query = query.or(`title.ilike.%${cleanTerm}%,content.ilike.%${cleanTerm}%`);
    }
  }

  const { data, error } = await query.order('created_at', { ascending: false }).limit(50);

  if (error || !data) return [];

  let formattedData: UnifiedPost[] = data.map((post: RawPostRow) => {
    let totalVotes = 0;
    if (post.replies && Array.isArray(post.replies)) {
      totalVotes = post.replies.reduce((sum: number, r: any) => {
        const votesList = r.votes || [];
        return sum + votesList.reduce((vSum: number, v: any) => vSum + (v.value * (v.weight || 1)), 0);
      }, 0);
    }

    return {
      ...post,
      author: post.author || { id: post.author_id, username: 'Anónimo' },
      community_name: post.communities?.name || 'General',
      tags: post.post_tags?.map((pt: { tag: { name: string } }) => pt.tag.name) || [],
      replies: [],
      links: post.links || [],
      replies_count: post.replies ? post.replies.length : 0,
      votes_count: Math.round(totalVotes)
    };
  });

  if (filter === 'most_replied' || filter === 'respondidos') {
    formattedData.sort((a, b) => b.replies_count - a.replies_count);
  } else if (filter === 'most_voted' || filter === 'votados') {
    formattedData.sort((a, b) => b.votes_count - a.votes_count);
  } else {
    formattedData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  return formattedData.slice(0, 20);
}

export async function getPosts(filter?: string): Promise<UnifiedPost[]> {
  return search("", undefined, undefined, filter);
}

export async function getPostsByUser(userId: string): Promise<UnifiedPost[]> {
  const supabase = await createClient();

  // EXCEPCIÓN DE ARQUITECTURA / RENDIMIENTO:
  // JOIN cruzado con `users` (Módulo 1) y `communities` (Módulo 2) para evitar N+1 queries.
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:users(id, username, avatar_url, reputation, role),
      communities(name),
      links:post_links(*),
      post_tags(tag:tags(name)),
      replies(id)
    `)
    .eq('author_id', userId)
    .eq('is_hidden', false)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map((post: RawPostRow) => ({
    ...post,
    author: post.author || { id: post.author_id, username: 'Anónimo' },
    community_name: post.communities?.name || 'General',
    tags: post.post_tags?.map((pt: { tag: { name: string } }) => pt.tag.name) || [],
    replies: [],
    links: post.links || [],
    replies_count: post.replies ? post.replies.length : 0,
    votes_count: 0
  }));
}
