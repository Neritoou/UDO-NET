"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchPosts } from '@module_3/search/actions/search';
import { MockPost } from '@module_3/posts/services/mock-data';

interface PostListProps {
  onSelectPost: (id: string) => void;
}

export default function PostList({ onSelectPost }: PostListProps) {
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<MockPost[]>([]);
  const [loading, setLoading] = useState(true);

  const query = searchParams.get('q') || '';
  const filter = searchParams.get('filter') || 'recientes';

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        let results: MockPost[] = [];
        if (query.trim() === '') {
          // No cargar posts inicialmente si no hay término de búsqueda
          results = [];
        } else {
          // Si hay búsqueda, analizar tags potenciales y buscar
          const tags = query.includes(',') 
            ? query.split(',').map(t => t.trim().toLowerCase()) 
            : [];
          results = await searchPosts(query, undefined, tags, filter);
        }
        setPosts(results);
      } catch (error) {
        console.error("Error al cargar publicaciones:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [query, filter]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-gray-400">Cargando publicaciones...</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="p-10 border border-dashed border-gray-800 rounded-xl text-center">
        <p className="text-gray-400 text-sm">
          {query 
            ? `No se encontraron resultados para "${query}"` 
            : 'Escribe un término en el buscador para empezar a explorar publicaciones.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {query && (
        <p className="text-xs text-gray-400">
          Resultados de búsqueda para: <span className="font-semibold text-white">&quot;{query}&quot;</span>
        </p>
      )}

      <ul className="space-y-3">
        {posts.map((post) => {
          const statusColor = 
            post.status === 'Resuelto' 
              ? 'bg-emerald-950/50 border border-emerald-800 text-emerald-400' 
              : post.status === 'Fijado' 
                ? 'bg-amber-950/50 border border-amber-800 text-amber-400' 
                : 'bg-blue-950/50 border border-blue-800 text-blue-400';

          return (
            <li
              key={post.id}
              onClick={() => onSelectPost(post.id)}
              className="p-5 bg-[#181818] border border-gray-850 hover:border-gray-700 rounded-xl cursor-pointer transition-all shadow-md group"
            >
              <div className="flex items-center justify-between gap-3 mb-2.5">
                <div className="flex items-center space-x-2.5">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    F / {post.community || 'General'}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusColor}`}>
                    {post.status}
                  </span>
                </div>

                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPost(post.id);
                  }}
                  className="px-3.5 py-1.5 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/20 hover:border-blue-600 text-xs font-semibold rounded-lg transition-all"
                >
                  Ver Hilo →
                </button>
              </div>

              <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors mb-1.5">
                {post.title}
              </h3>
              <p className="text-sm text-gray-300 line-clamp-2 mb-4">
                {post.content}
              </p>

              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3.5">
                  {post.tags.map((tag) => (
                    <span 
                      key={tag} 
                      className="px-2 py-0.5 bg-[#252525] border border-gray-800 rounded text-xs text-gray-400"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-850/50 pt-3">
                <div>
                  Por <span className="font-semibold text-gray-300">{post.author?.username || 'Anónimo'}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span>{post.votes} votos</span>
                  <span>•</span>
                  <span>{post.repliesCount} respuestas</span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
