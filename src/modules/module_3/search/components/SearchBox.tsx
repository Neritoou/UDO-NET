"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SearchBox() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Inicializar estados con valores de la URL
  const queryParam = searchParams.get('q') || '';
  const filterParam = searchParams.get('filter') || 'recientes';

  const [searchTerm, setSearchTerm] = useState(queryParam);
  const [filter, setFilter] = useState(filterParam);

  // Sincronizar estados locales si cambian los parámetros de la URL externamente
  useEffect(() => {
    setSearchTerm(searchParams.get('q') || '');
    setFilter(searchParams.get('filter') || 'recientes');
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    
    if (searchTerm.trim()) {
      params.set('q', searchTerm.trim());
    } else {
      params.delete('q');
    }
    params.set('filter', filter);
    
    router.push(`?${params.toString()}`);
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    const params = new URLSearchParams(searchParams.toString());
    params.set('filter', newFilter);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="bg-[#181818] border border-gray-850 p-5 rounded-xl space-y-4">
      <h2 className="text-sm font-semibold text-gray-400">Filtrar y Buscar Publicaciones</h2>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
        <input 
          type="text" 
          placeholder="Busca por título, comunidad o tag..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-[#121212] border border-gray-800 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
        
        <select 
          value={filter}
          onChange={(e) => handleFilterChange(e.target.value)}
          className="px-4 py-2.5 bg-[#121212] border border-gray-800 rounded-lg text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
        >
          <option value="recientes">Más recientes</option>
          <option value="votados">Más votados</option>
          <option value="respuestas">Más respuestas</option>
        </select>

        <button 
          type="submit" 
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-semibold rounded-lg transition-all shadow-md"
        >
          Buscar
        </button>
      </form>
    </div>
  );
}