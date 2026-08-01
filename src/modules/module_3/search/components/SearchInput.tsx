"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SearchInputProps {
  placeholder?: string;
  targetPath?: string;
}

export default function SearchInput({ placeholder = "Busca por título, comunidad o tag...", targetPath = "/" }: SearchInputProps) {
  const [term, setTerm] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!term.trim()) return;
    router.push(`${targetPath}?q=${encodeURIComponent(term.trim())}`);
  };

  return (
    <form onSubmit={handleSearch} className="flex items-center w-full max-w-md">
      <input
        type="text"
        placeholder={placeholder}
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-800 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
      />
      <button
        type="submit"
        className="ml-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-semibold rounded-lg transition-all shadow-md"
      >
        Buscar
      </button>
    </form>
  );
}
