"use client";

import { useState, Suspense } from 'react';
import { CreatePostProvider } from '@module_3/posts/exports';
import SearchBox from "@module_3/search/components/SearchBox";
import ThreadView from '@module_3/posts/components/ThreadView';
import PostList from '@module_3/posts/components/PostList';

function Module3Content() {
  const [selectedThread, setSelectedThread] = useState<string | null>(null);

  const openThread = (id: string) => setSelectedThread(id);
  const closeThread = () => setSelectedThread(null);

  return (
    <div className="max-w-[1000px] mx-auto">
      {selectedThread ? (
        <ThreadView threadId={selectedThread} onBack={closeThread} />
      ) : (
        <SearchBox>
          <PostList onSelectPost={openThread} />
        </SearchBox>
      )}
    </div>
  );
}

export default function Module3Container() {
  return (
    <CreatePostProvider>
      <Suspense fallback={<div className="max-w-[1000px] mx-auto p-12 text-center font-candal font-normal text-gray-custom text-p">Cargando módulo...</div>}>
        <Module3Content />
      </Suspense>
    </CreatePostProvider>
  );
}