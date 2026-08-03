'use client'

import { useState } from "react";
import { PostList, ThreadView } from "@module_3/exports";
import type { UnifiedPost } from "@module_3/exports";

interface ICOMMUNITYFEED {
    posts: UnifiedPost[];
    currentUserId?: string | null;
}

export default function CommunityFeed({ posts, currentUserId }: ICOMMUNITYFEED) {
    const [selectedPost, setSelectedPost] = useState<UnifiedPost | null>(null);

    const handleSelectPost = (id: string) => {
        const found = posts.find((post) => post.id === id) ?? null;
        setSelectedPost(found);
    };

    if (selectedPost) {
        return (
        <ThreadView
            threadId={selectedPost.id}
            initialThread={selectedPost}
            onBack={() => setSelectedPost(null)}
            currentUserId={currentUserId}
        />
        );
    }

    return <PostList posts={posts} onSelectPost={handleSelectPost} currentUserId={currentUserId} />;
}