"use client";

import React, { createContext, useContext, useState } from 'react';
import CreatePostModal from '@module_3/posts/components/CreatePostForm';

interface CreatePostContextType {
  open: () => void;
  close: () => void;
  isOpen: boolean;
}

const CreatePostContext = createContext<CreatePostContextType | undefined>(undefined);

export function CreatePostProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return (
    <CreatePostContext.Provider value={{ open, close, isOpen }}>
      {children}
      <CreatePostModal isOpen={isOpen} onClose={close} />
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
