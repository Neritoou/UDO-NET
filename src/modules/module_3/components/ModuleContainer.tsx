"use client";

import { Suspense } from 'react';
import { CreatePostProvider, useCreatePost } from '@module_3/posts/exports';
import SearchBox from "@module_3/search/components/SearchBox";
import ThreadView from '@module_3/posts/components/ThreadView';
import PostList from '@module_3/posts/components/PostList';
import { useThreadNavigation } from '@module_3/hooks/useThreadNavigation';

function Module3Content() {
  const { selectedThread, openThread, closeThread } = useThreadNavigation();
  const { open: openCreatePost } = useCreatePost();

  return (
    <div className="max-w-[1000px] mx-auto bg-[#121212] border border-gray-850 min-h-[90vh] rounded-xl p-6 space-y-6 shadow-xl text-white">
      {selectedThread ? ( 
        <ThreadView threadId={selectedThread} onBack={closeThread} />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-850 pb-5">
            <div className="flex-1">
              <SearchBox />
            </div>
            
            <div className="flex items-center">
              <button
                onClick={openCreatePost}
                className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold text-sm rounded-lg transition-all shadow-md"
              >
                + Crear Publicación
              </button>
            </div>
          </div>
          
          <PostList onSelectPost={openThread} />
        </>
      )}
    </div>
  );
}

export default function Module3Container() {
  return (
    <CreatePostProvider>
      <Suspense fallback={<div className="max-w-[1000px] mx-auto bg-[#121212] border border-gray-850 min-h-[90vh] rounded-xl p-12 text-center text-gray-400 text-sm shadow-xl">Cargando módulo...</div>}>
        <Module3Content />
      </Suspense>
    </CreatePostProvider>
  );
}
