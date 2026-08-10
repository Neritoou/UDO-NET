"use client";

import React, { createContext, useContext, useState } from 'react';
import CreatePostModal from '@module_3/posts/components/CreatePostForm';
import { CommunityOption } from '@module_3/posts/actions/post';

interface OpenOptions {
  communityId?: string;
  avatar?: string;
  initialText?: string;
}

interface CreatePostContextType {
  open: (options?: OpenOptions) => void;
  openModal: (options?: OpenOptions) => void;
  close: () => void;
  isOpen: boolean;
  communityId?: string;
  avatar?: string;
  initialText?: string;
}

const CreatePostContext = createContext<CreatePostContextType | undefined>(undefined);

export function CreatePostProvider({ children, communities = [] }: { children: React.ReactNode; communities?: CommunityOption[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [communityId, setCommunityId] = useState<string | undefined>(undefined);
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [initialText, setInitialText] = useState<string | undefined>(undefined);

  const open = (options?: OpenOptions) => {
    if (options?.communityId) setCommunityId(options.communityId);
    if (options?.avatar !== undefined) setAvatar(options.avatar);
    if (options?.initialText !== undefined) setInitialText(options.initialText);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setInitialText(undefined);
  };

  return (
    <CreatePostContext.Provider value={{ open, openModal: open, close, isOpen, communityId, avatar, initialText }}>
      {children}
      <CreatePostModal 
        isOpen={isOpen} 
        onClose={close} 
        initialCommunities={communities}
        initialCommunity={communityId} 
        initialText={initialText}
        userAvatar={avatar} 
      />
    </CreatePostContext.Provider>
  );
}

export function useCreatePost() {
  const context = useContext(CreatePostContext);
  if (!context) {
    throw new Error('useCreatePost debe utilizarse dentro de un CreatePostProvider');
  }
  return context;
}