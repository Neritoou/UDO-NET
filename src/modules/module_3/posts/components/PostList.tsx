"use client";

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { addReplyAction } from '@module_3/posts/actions/reply';
import { UnifiedPost } from '@module_3/posts/services/supabase-service';
import VoteManager from '@module_4/votes/components/VoteManager';
import UserBadge from '@module_4/reputation/components/UserBadge';
import UserAvatar from '../../components/UserAvatar';
import Toast from '../../components/Toast';
import {
  PaperPlaneIcon,
  ChevronRightIcon
} from '../../components/icons';
import { formatDate } from '@/lib/utils/formatDate';

export interface PostCardProps {
  post: UnifiedPost;
  onSelectPost?: (id: string) => void;
  isThreadView?: boolean;
  onMainReplyClick?: () => void;
  showMainReplyBox?: boolean;
  onTagClick?: (tag: string) => void;
}

export function PostCard({
  post,
  onSelectPost,
  isThreadView = false,
  onMainReplyClick,
  showMainReplyBox = false,
  onTagClick
}: PostCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [showAllTags, setShowAllTags] = useState(false);
  const [quickReply, setQuickReply] = useState('');

  const authorName = post.author?.username || 'Anónimo';
  const authorCareer = post.author?.bio || 'Carrera';
  const communityBreadcrumb = `F / ${post.community_name || 'General'}`;
  const relativeDate = formatDate(post.created_at);

  const filter = searchParams.get('filter') || 'most_replied';

  // Si tiene link detectado tomamos el primero
  const firstLink = post.links && post.links.length > 0 ? post.links[0] : null;

  const handleTagClick = (tag: string) => {
    const cleanTag = tag.replace('#', '');
    const params = new URLSearchParams(searchParams.toString());
    params.set('q', cleanTag);
    params.set('filter', filter);
    if (onTagClick) {
      onTagClick(cleanTag);
    }
    router.push(`/?${params.toString()}`);
  };

  const [isSubmittingReply, startTransition] = useTransition();

  const handleQuickReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickReply.trim() || isSubmittingReply || post.status === 'closed') return;

    startTransition(async () => {
      const res = await addReplyAction(post.id, null, quickReply);
      if (res.success) {
        setQuickReply('');
        setToast({ message: '¡Respuesta guardada con éxito!', type: 'success' });
      } else {
        setToast({ message: res.error || 'Error al guardar la respuesta.', type: 'error' });
      }
    });
  };

  const tags = post.tags || [];
  const hasManyTags = tags.length > 3;
  const visibleTags = hasManyTags ? tags.slice(0, 2) : tags;

  return (
    <article className="bg-pure-white rounded-[30px] p-6 transition-all font-candal font-normal relative">
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Cabecera del post */}
      <div className="-mx-6 px-6 pt-1 pb-4 mb-4 border-b border-white-gray flex items-center justify-between gap-4">
        <h2
          onClick={() => onSelectPost && onSelectPost(post.id)}
          className="font-candal font-normal text-h4 text-main-black hover:text-main-blue transition-colors cursor-pointer leading-tight flex-1"
        >
          {post.title}
        </h2>

        <div className="flex items-center gap-2 shrink-0 text-alpha-black">
          {/* Badge de fijado */}
          {post.is_pinned && (
            <span className="px-2.5 py-0.5 rounded-full font-candal font-normal text-extra-tiny bg-deep-orange/15 text-deep-orange border border-deep-orange/30">
              📌 Fijado
            </span>
          )}

          {/* Badge de cerrado */}
          {post.status === 'closed' && (
            <span className="px-2.5 py-0.5 rounded-full font-candal font-normal text-extra-tiny bg-gray-custom/15 text-gray-custom">
              🔒 Cerrado
            </span>
          )}

          <span className="font-candal font-normal text-tiny text-alpha-black">
            {communityBreadcrumb}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setToast({ message: 'Opciones de publicación', type: 'info' });
            }}
            className="font-candal font-normal text-p text-alpha-black hover:text-main-black cursor-pointer bg-transparent border-0 px-1"
          >
            •••
          </button>
        </div>
      </div>

      {/* Fila del autor */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-start gap-4">
          <div className="mt-[3px] shrink-0">
            <UserAvatar avatarUrl={post.author?.avatar_url} username={authorName} size="w-[50px] h-[50px]" />
          </div>

          <div className="flex flex-col space-y-[7px]">
            <h4 className="font-candal font-normal text-h4 text-main-black leading-tight m-0 p-0">
              {authorName}
            </h4>

            {post.author && (
              <div className="flex items-center my-[1px]">
                <UserBadge
                  reputation={post.author.reputation || 0}
                  role={post.author.role || 'regular'}
                />
              </div>
            )}

            <h5 className="font-candal font-normal text-h5 text-alpha-black leading-tight m-0 p-0">
              {authorCareer}
            </h5>
          </div>
        </div>

        {/* Tags a la derecha sólo en feed */}
        {!isThreadView && tags.length > 0 && (
          <div className="relative flex flex-col items-end space-y-1 text-right shrink-0">
            {visibleTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleTagClick(tag);
                }}
                className="px-2.5 py-0.5 rounded-full bg-lite-white text-main-black border border-white-gray hover:bg-regular-blue hover:text-pure-white transition-colors cursor-pointer border-0 font-open-sans font-extrabold text-extra-tiny"
              >
                #{tag}
              </button>
            ))}

            {hasManyTags && (
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAllTags(!showAllTags);
                  }}
                  className="px-2.5 py-0.5 rounded-full bg-main-blue/15 text-main-blue hover:bg-regular-blue hover:text-pure-white transition-colors cursor-pointer border-0 font-open-sans font-extrabold text-extra-tiny"
                >
                  +{tags.length - 2} más ▾
                </button>

                {showAllTags && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 top-full mt-1 bg-pure-white border border-white-gray rounded-[16px] p-2.5 shadow-lg z-50 flex flex-col gap-1 min-w-[120px]"
                  >
                    <span className="font-candal font-normal text-extra-tiny text-alpha-black border-b border-white-gray pb-1 px-1">
                      Todas las etiquetas
                    </span>
                    {tags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          setShowAllTags(false);
                          handleTagClick(tag);
                        }}
                        className="text-left px-2 py-1 rounded-md hover:bg-regular-blue hover:text-pure-white text-main-black font-open-sans font-extrabold text-extra-tiny transition-colors border-0 bg-transparent"
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Contenido */}
      {post.content && (
        <p className={`font-candal font-normal text-p text-lite-black leading-relaxed mb-4 ${isThreadView ? 'whitespace-pre-wrap' : 'line-clamp-3'}`}>
          {post.content}
        </p>
      )}

      {/* Previsualización del enlace en la tarjeta */}
      {firstLink && (
        <div className="mt-3 mb-4">
          <a 
            href={firstLink.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            onClick={(e) => e.stopPropagation()}
            className="flex items-center overflow-hidden bg-lite-white rounded-[20px] hover:bg-white-gray/50 transition group p-3 gap-4 border-0"
          >
            {firstLink.image_url && (
              <div className="relative w-28 h-20 sm:w-32 sm:h-20 flex-shrink-0 overflow-hidden rounded-[14px] bg-pure-white">
                <img 
                  src={firstLink.image_url} 
                  alt={firstLink.title || 'Vista previa'} 
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" 
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} 
                />
              </div>
            )}
            <div className="flex-1 min-w-0 pr-2 space-y-1 font-candal font-normal">
              <div className="flex items-center space-x-1.5 text-tiny text-regular-blue">
                <span>🔗</span>
                <span className="truncate">{(() => { try { return new URL(firstLink.url).hostname; } catch { return firstLink.url; } })()}</span>
              </div>
              <h3 className="font-candal font-normal text-p text-main-black group-hover:text-regular-blue transition-colors line-clamp-1">
                {firstLink.title || firstLink.url}
              </h3>
              {firstLink.description && (
                <p className="text-tiny text-gray-custom line-clamp-2 leading-relaxed">
                  {firstLink.description}
                </p>
              )}
            </div>
          </a>
        </div>
      )}

      {/* Tags abajo en threadview */}
      {isThreadView && tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagClick(tag)}
              className="px-4 py-1.5 bg-regular-blue hover:bg-dark-main-blue text-pure-white font-open-sans font-extrabold text-tiny rounded-full transition-all cursor-pointer border-0 active:scale-95 shadow-xs"
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Fecha relativa */}
      {!isThreadView && (
        <div className="flex items-center justify-end text-tiny font-candal font-normal mb-3">
          <span className="text-alpha-black">{relativeDate}</span>
        </div>
      )}

      {/* Barra de acciones inferior */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <div onClick={(e) => e.stopPropagation()}>
            <VoteManager
              replyId={post.id}
              initialVoteCount={post.votes_count || 0}
              currentSessionUserId="00000000-0000-0000-0000-000000000001"
              replyAuthorId={post.author_id || post.author?.id || ''}
            />
          </div>

          {!isThreadView && post.status !== 'closed' && (
            <form 
              onSubmit={handleQuickReplySubmit}
              onClick={(e) => e.stopPropagation()}
              className="hidden sm:flex items-center bg-lite-white rounded-full border-2 border-main-blue w-64 h-[38px] overflow-hidden p-0 relative"
            >
              <input 
                type="text" 
                value={quickReply}
                onChange={(e) => setQuickReply(e.target.value)}
                placeholder="Escribe una respuesta..." 
                className="bg-transparent border-0 text-tiny font-candal font-normal text-main-black placeholder:text-alpha-black focus:outline-none flex-1 pl-4 pr-2 min-w-0"
              />
              <button 
                type="submit"
                className="group/sendbtn h-[calc(100%+4px)] -mr-[2px] -my-[2px] aspect-square bg-main-blue hover:bg-dark-main-blue flex items-center justify-center border-0 text-pure-white cursor-pointer shrink-0 transition-all duration-200 rounded-full"
                title="Enviar respuesta rápida"
              >
                <PaperPlaneIcon className="w-4 h-4 text-pure-white group-hover/sendbtn:scale-115 transition-transform duration-200" />
              </button>
            </form>
          )}
        </div>

        {isThreadView ? (
          <button 
            type="button"
            disabled={post.status === 'closed'}
            onClick={onMainReplyClick} 
            className="px-6 py-2.5 bg-regular-blue hover:bg-dark-main-blue disabled:opacity-50 text-pure-white font-candal font-normal text-p rounded-full transition-all cursor-pointer border-0 shadow-sm active:scale-95"
          >
            {post.status === 'closed' ? 'Hilo Cerrado' : showMainReplyBox ? 'Cancelar' : 'Responder al Hilo'}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onSelectPost && onSelectPost(post.id)}
            className="font-candal font-normal text-tiny text-alpha-black hover:text-main-black flex items-center gap-1.5 cursor-pointer transition-colors bg-transparent border-0 group"
          >
            <span>Ver respuestas</span>
            <ChevronRightIcon className="w-5 h-5 text-main-black group-hover:scale-110 transition-transform" />
          </button>
        )}
      </div>

    </article>
  );
}

export interface PostListProps {
  posts: UnifiedPost[];
  onSelectPost?: (id: string) => void;
}

export default function PostList({ posts, onSelectPost }: PostListProps) {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  if (posts.length === 0) {
    return (
      <div className="p-10 bg-pure-white rounded-[30px] text-center">
        <p className="font-candal font-normal text-p text-alpha-black">
          {query ? (
            <>
              No se encontraron publicaciones para <span className="font-open-sans font-extrabold text-main-black">&quot;{query}&quot;</span>
            </>
          ) : (
            'No hay publicaciones disponibles por el momento.'
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {query && (
        <p className="font-candal font-normal text-tiny text-alpha-black px-6 sm:px-8 py-1">
          Resultados de búsqueda para: <span className="font-open-sans font-extrabold text-main-black">&quot;{query}&quot;</span>
        </p>
      )}

      <div className="space-y-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} onSelectPost={onSelectPost} />
        ))}
      </div>
    </div>
  );
}