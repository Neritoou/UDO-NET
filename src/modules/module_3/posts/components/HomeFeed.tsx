"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCreatePost } from '@module_3/posts/exports';
import PostList from '@module_3/posts/components/PostList';
import ThreadView from '@module_3/posts/components/ThreadView';
import { UnifiedPost } from '@module_3/posts/services/supabase-service';
import { getThread } from '@module_3/posts/actions/thread';

interface HomeFeedProps {
  initialPosts: UnifiedPost[];
  currentUserId?: string | null;
}

export default function HomeFeed({ initialPosts, currentUserId }: HomeFeedProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const threadParam = searchParams.get('thread') || searchParams.get('post');

  const { open } = useCreatePost();
  const [newThreadText, setNewThreadText] = useState("");

  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [currentThread, setCurrentThread] = useState<UnifiedPost | null>(null);
  const [loadingThread, setLoadingThread] = useState(false);

  const handleCreateThreadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    open({ initialText: newThreadText });
    setNewThreadText("");
  };

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

  if (selectedThread) {
    return (
      <div className="max-w-[1000px] mx-auto">
        {loadingThread ? (
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
        )}
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto space-y-4">
      {/* Tarjeta superior: Añadir un nuevo hilo como campo de texto */}
      <form onSubmit={handleCreateThreadSubmit} className="flex items-center justify-between bg-pure-white rounded-[30px] px-6 py-3 shadow-sm border border-gray-100 gap-4">
        <input
          type="text"
          value={newThreadText}
          onChange={(e) => setNewThreadText(e.target.value)}
          placeholder="Añadir un nuevo hilo"
          className="flex-1 bg-transparent font-candal font-bold text-base sm:text-lg text-main-black placeholder:text-gray-400 border-0 focus:outline-none"
        />
        <button
          type="submit"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#5D9CFC] text-white hover:bg-blue-600 transition-all shadow-md cursor-pointer border-0"
          title="Crear publicación"
          aria-label="Añadir un nuevo hilo"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </form>

      {/* Lista Principal de Publicaciones */}
      <PostList posts={initialPosts} onSelectPost={openThread} currentUserId={currentUserId} />
    </div>
  );
}
