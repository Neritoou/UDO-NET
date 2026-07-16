import { useState } from 'react';

export function useThreadNavigation() {
  const [selectedThread, setSelectedThread] = useState<string | null>(null);

  const openThread = (id: string) => setSelectedThread(id);
  const closeThread = () => setSelectedThread(null);

  return {
    selectedThread,
    openThread,
    closeThread,
  };
}
