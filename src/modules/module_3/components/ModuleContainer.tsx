"use client";

import { useState, Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CreatePostProvider } from '@module_3/posts/exports';
import SearchBox from "@module_3/search/components/SearchBox";
import ThreadView from '@module_3/posts/components/ThreadView';
import PostList from '@module_3/posts/components/PostList';
import { UnifiedPost } from '@module_3/posts/services/supabase-service';
import { CommunityOption } from '@module_3/posts/actions/post';
import { getThread } from '@module_3/posts/actions/thread';

interface Module3ContentProps {
  initialPosts: UnifiedPost[];
  communities: CommunityOption[];
}

function Module3Content({ initialPosts, communities }: Module3ContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const threadParam = searchParams.get('thread') || searchParams.get('post');

  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [currentThread, setCurrentThread] = useState<UnifiedPost | null>(null);
  const [loadingThread, setLoadingThread] = useState(false);

  const openThread = async (id: string) => {
    setLoadingThread(true);
    setSelectedThread(id);
    const data = await getThread(id);
    setCurrentThread(data);
    setLoadingThread(false);
  };

  useEffect(() => {
    if (threadParam) {
      openThread(threadParam);
    }
  }, [threadParam]);

  const closeThread = () => {
    setSelectedThread(null);
    setCurrentThread(null);
    if (threadParam) {
      router.push('/');
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto">
      {selectedThread ? (
        loadingThread ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-3">
            <div className="w-8 h-8 border-4 border-regular-blue border-t-transparent rounded-full animate-spin"></div>
            <p className="font-candal font-normal text-p text-gray-custom">Cargando publicación...</p>
          </div>
        ) : (
          <ThreadView
            threadId={selectedThread}
            initialThread={currentThread}
            onBack={closeThread}
          />
        )
      ) : (
        <SearchBox>
          <PostList posts={initialPosts} onSelectPost={openThread} />
        </SearchBox>
      )}
    </div>
  );
}

interface Module3ContainerProps {
  initialPosts: UnifiedPost[];
  communities: CommunityOption[];
}

export default function Module3Container({ initialPosts, communities }: Module3ContainerProps) {
  return (
    <CreatePostProvider communities={communities}>
      <Suspense fallback={<div className="max-w-[1000px] mx-auto p-12 text-center font-candal font-normal text-gray-custom text-p">Cargando módulo...</div>}>
        <Module3Content initialPosts={initialPosts} communities={communities} />
      </Suspense>
    </CreatePostProvider>
  );
}