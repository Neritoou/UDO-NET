"use client";

import React, { createContext, useContext, useState } from 'react';
import CreatePostModal from '@module_3/posts/components/CreatePostForm';

interface OpenOptions {
  communityId?: string;
  avatar?: string;
}

interface CreatePostContextType {
  open: (options?: OpenOptions) => void;
  close: () => void;
  isOpen: boolean;
  communityId?: string;
  avatar?: string;
}

const CreatePostContext = createContext<CreatePostContextType | undefined>(undefined);

export function CreatePostProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [communityId, setCommunityId] = useState<string | undefined>(undefined);
  const [avatar, setAvatar] = useState<string | undefined>(undefined);

  const open = (options?: OpenOptions) => {
    if (options?.communityId) setCommunityId(options.communityId);
    if (options?.avatar !== undefined) setAvatar(options.avatar);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
  };

  return (
    <CreatePostContext.Provider value={{ open, close, isOpen, communityId, avatar }}>
      {children}
      <CreatePostModal 
        isOpen={isOpen} 
        onClose={close} 
        initialCommunity={communityId} 
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