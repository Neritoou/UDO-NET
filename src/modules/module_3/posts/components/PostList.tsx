"use client";

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { addReplyAction } from '@module_3/posts/actions/reply';
import { UnifiedPost } from '@module_3/posts/services/supabase-service';
import UserBadge from '@module_4/reputation/components/UserBadge';
import UserAvatar from '../../components/UserAvatar';
import Toast from '../../components/Toast';
import {
  PaperPlaneIcon,
  ChevronRightIcon,
  CommentIcon,
} from '../../components/icons';
import { formatDate } from '@/lib/utils/formatDate';
import { ReportModal } from '@/modules/module_5/reports/components/ReportModal';
import { createReportAction } from '@/modules/module_5/reports/actions/create-report.action';

export interface PostCardProps {
  post: UnifiedPost;
  onSelectPost?: (id: string) => void;
  isThreadView?: boolean;
  isCompact?: boolean;
  onMainReplyClick?: () => void;
  showMainReplyBox?: boolean;
  onTagClick?: (tag: string) => void;
  currentUserId?: string | null;
}

export function PostCard({
  post,
  onSelectPost,
  isThreadView = false,
  isCompact = false,
  onMainReplyClick,
  showMainReplyBox = false,
  onTagClick,
  currentUserId
}: PostCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [showAllTags, setShowAllTags] = useState(false);
  const [quickReply, setQuickReply] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const authorName = post.author?.username || 'Anónimo';
  const relativeDate = formatDate(post.created_at);
  const filter = searchParams.get('filter') || 'most_replied';
  const firstLink = post.links && post.links.length > 0 ? post.links[0] : null;

  // Construir breadcrumb de comunidad con links
  const communitySlug = post.community_slug || post.community?.slug || ''
  const communityParentSlug = post.community_parent_slug ?? null
  const communityParentName = post.community_parent_name ?? null
  const communityName = post.community_name || post.community?.name || 'General'

  const handleTagClick = (tag: string) => {
    const cleanTag = tag.replace('#', '');
    const params = new URLSearchParams(searchParams.toString());
    params.set('q', cleanTag);
    params.set('filter', filter);
    if (onTagClick) onTagClick(cleanTag);
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
    <article className={`bg-pure-white transition-all font-candal font-normal relative ${isCompact ? 'rounded-2xl p-3 sm:p-4 shadow-sm' : 'rounded-[20px] sm:rounded-[30px] p-4 sm:p-6'}`}>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Fila superior: breadcrumb comunidad + badges + menú */}
      <div className={`flex items-center justify-between gap-2 min-w-0 ${isCompact ? 'mb-1.5' : 'mb-2'}`}>
        <div className="flex items-center gap-1.5 min-w-0 overflow-hidden text-[10px] sm:text-tiny">
          {communityParentSlug ? (
            <>
              <Link
                href={`/communities/${communityParentSlug}`}
                onClick={(e) => e.stopPropagation()}
                className="hidden sm:inline text-alpha-black hover:text-regular-blue transition-colors truncate"
              >
                {communityParentName || communityParentSlug}
              </Link>
              <span className="hidden sm:inline text-alpha-black shrink-0">/</span>
              <Link
                href={`/communities/${communityParentSlug}/${communitySlug}`}
                onClick={(e) => e.stopPropagation()}
                className="text-alpha-black hover:text-regular-blue transition-colors truncate font-bold"
              >
                {communityName}
              </Link>
            </>
          ) : communitySlug ? (
            <Link
              href={`/communities/${communitySlug}`}
              onClick={(e) => e.stopPropagation()}
              className="text-alpha-black hover:text-regular-blue transition-colors truncate"
            >
              {communityName}
            </Link>
          ) : (
            <span className="text-alpha-black truncate">{communityName}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {post.is_pinned && (
            <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-extra-tiny bg-deep-orange/15 text-deep-orange border border-deep-orange/30">
              📌
            </span>
          )}

          {post.status === 'closed' && (
            <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-extra-tiny bg-gray-custom/15 text-gray-custom">
              🔒
            </span>
          )}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className="text-p text-alpha-black hover:text-main-black cursor-pointer bg-transparent border-0 px-1"
              aria-label="Opciones"
            >
              •••
            </button>
            {isMenuOpen && (
              <div
                className="absolute right-0 top-full mt-1 w-44 bg-pure-white border border-white-gray rounded-[16px] shadow-lg z-50 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsReportModalOpen(true);
                  }}
                  className="w-full text-left px-4 py-2.5 text-tiny text-deep-orange hover:bg-lite-white transition-colors cursor-pointer border-0 bg-transparent flex items-center gap-2"
                >
                  <span>🚩</span>
                  <span>Reportar</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Título — ahora ocupa todo el ancho */}
      <h2
        onClick={() => onSelectPost && onSelectPost(post.id)}
        className={`font-candal font-normal text-main-black hover:text-main-blue transition-colors cursor-pointer leading-tight min-w-0 break-words [overflow-wrap:anywhere] ${isCompact ? 'text-p sm:text-h5 mb-2.5' : 'text-h5 sm:text-h4 mb-3 sm:mb-4'}`}
      >
        {post.title}
      </h2>


      {/* Autor — clickeable */}
      <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 min-w-0 ${isCompact ? 'mb-2.5' : 'mb-3 sm:mb-4'}`}>
        <Link
          href={`/profile/${authorName}`}
          className="flex items-start gap-3 min-w-0 group"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mt-[2px] shrink-0">
            <UserAvatar avatarUrl={post.author?.avatar_url} username={authorName} size={isCompact ? 'w-[32px] h-[32px] sm:w-[36px] sm:h-[36px]' : 'w-[40px] h-[40px] sm:w-[50px] sm:h-[50px]'} />
          </div>
          <div className="flex flex-col space-y-[2px] min-w-0">
            <h4 className={`font-candal font-normal text-main-black group-hover:text-regular-blue transition-colors leading-tight m-0 p-0 break-words min-w-0 ${isCompact ? 'text-tiny sm:text-p font-bold' : 'text-p sm:text-h4'}`}>
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
          </div>
        </Link>

        {/* Tags */}
        {!isThreadView && tags.length > 0 && (
          <div className="relative flex flex-row sm:flex-col items-start sm:items-end gap-1 flex-wrap">
            {visibleTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleTagClick(tag);
                }}
                className="px-2 sm:px-2.5 py-0.5 rounded-full bg-lite-white text-main-black border border-white-gray hover:bg-regular-blue hover:text-pure-white transition-colors cursor-pointer font-open-sans font-extrabold text-[10px] sm:text-extra-tiny"
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
                  className="px-2 sm:px-2.5 py-0.5 rounded-full bg-main-blue/15 text-main-blue hover:bg-regular-blue hover:text-pure-white transition-colors cursor-pointer border-0 font-open-sans font-extrabold text-[10px] sm:text-extra-tiny"
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
        <p className={`font-candal font-normal text-tiny sm:text-p text-lite-black leading-relaxed mb-3 sm:mb-4 break-words [overflow-wrap:anywhere] ${isThreadView ? 'whitespace-pre-wrap' : 'line-clamp-3'}`}>
          {post.content}
        </p>
      )}

      {/* Link preview */}
      {firstLink && (
        <div className="mt-2 sm:mt-3 mb-3 sm:mb-4">
          <a
            href={firstLink.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex flex-col sm:flex-row items-stretch sm:items-center overflow-hidden bg-lite-white rounded-[16px] sm:rounded-[20px] hover:bg-white-gray/50 transition group p-3 gap-3 sm:gap-4 border-0"
          >
            {firstLink.image_url && (
              <div className="relative w-full sm:w-28 h-32 sm:h-20 flex-shrink-0 overflow-hidden rounded-[12px] sm:rounded-[14px] bg-pure-white">
                <img
                  src={firstLink.image_url}
                  alt={firstLink.title || 'Vista previa'}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
              </div>
            )}
            <div className="flex-1 min-w-0 space-y-1 font-candal font-normal">
              <div className="flex items-center space-x-1.5 text-[10px] sm:text-tiny text-regular-blue">
                <span>🔗</span>
                <span className="truncate">{(() => { try { return new URL(firstLink.url).hostname; } catch { return firstLink.url; } })()}</span>
              </div>
              <h3 className="font-candal font-normal text-tiny sm:text-p text-main-black group-hover:text-regular-blue transition-colors line-clamp-1">
                {firstLink.title || firstLink.url}
              </h3>
              {firstLink.description && (
                <p className="text-[10px] sm:text-tiny text-gray-custom line-clamp-2 leading-relaxed">
                  {firstLink.description}
                </p>
              )}
            </div>
          </a>
        </div>
      )}

      {/* Tags en threadview */}
      {isThreadView && tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagClick(tag)}
              className="px-3 sm:px-4 py-1 sm:py-1.5 bg-regular-blue hover:bg-dark-main-blue text-pure-white font-open-sans font-extrabold text-[10px] sm:text-tiny rounded-full transition-all cursor-pointer border-0 active:scale-95 shadow-xs"
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Fecha */}
      {!isThreadView && (
        <div className="flex items-center justify-end text-[10px] sm:text-tiny font-candal font-normal mb-2 sm:mb-3">
          <span className="text-alpha-black" suppressHydrationWarning>{relativeDate}</span>
        </div>
      )}

      {/* Barra de acciones */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 pt-1">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div
            className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-lite-white border border-white-gray flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-tiny font-candal font-normal text-main-black select-none"
          >
            <CommentIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-regular-blue shrink-0" />
            <span>
              {post.replies_count ?? post.replies?.length ?? 0} {(post.replies_count ?? post.replies?.length ?? 0) === 1 ? 'respuesta' : 'respuestas'}
            </span>
          </div>

          {!isThreadView && post.status !== 'closed' && (
            <form
              onSubmit={handleQuickReplySubmit}
              onClick={(e) => e.stopPropagation()}
              className="hidden md:flex items-center bg-lite-white rounded-full border-2 border-main-blue w-48 lg:w-64 h-[34px] sm:h-[38px] overflow-hidden p-0 relative"
            >
              <input
                type="text"
                value={quickReply}
                onChange={(e) => setQuickReply(e.target.value)}
                placeholder="Escribe una respuesta..."
                className="bg-transparent border-0 text-[10px] sm:text-tiny font-candal font-normal text-main-black placeholder:text-alpha-black focus:outline-none flex-1 pl-3 sm:pl-4 pr-2 min-w-0"
              />
              <button
                type="submit"
                className="group/sendbtn h-[calc(100%+4px)] -mr-[2px] -my-[2px] aspect-square bg-main-blue hover:bg-dark-main-blue flex items-center justify-center border-0 text-pure-white cursor-pointer shrink-0 transition-all duration-200 rounded-full"
                title="Enviar respuesta rápida"
              >
                <PaperPlaneIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pure-white group-hover/sendbtn:scale-115 transition-transform duration-200" />
              </button>
            </form>
          )}
        </div>

        {isThreadView ? (
          <button
            type="button"
            disabled={post.status === 'closed'}
            onClick={onMainReplyClick}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 bg-regular-blue hover:bg-dark-main-blue disabled:opacity-50 text-pure-white font-candal font-normal text-tiny sm:text-p rounded-full transition-all cursor-pointer border-0 shadow-sm active:scale-95 text-center"
          >
            {post.status === 'closed' ? 'Hilo Cerrado' : showMainReplyBox ? 'Cancelar' : 'Responder al Hilo'}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onSelectPost && onSelectPost(post.id)}
            className="font-candal font-normal text-[10px] sm:text-tiny text-alpha-black hover:text-main-black flex items-center gap-1 sm:gap-1.5 cursor-pointer transition-colors bg-transparent border-0 group self-end sm:self-auto"
          >
            <span>Ver respuestas</span>
            <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-main-black group-hover:scale-110 transition-transform" />
          </button>
        )}
      </div>

      {/* Modal de Reporte */}
      <ReportModal
        isOpen={isReportModalOpen}
        targetId={post.id}
        targetType="post"
        onClose={() => setIsReportModalOpen(false)}
        onSubmitReport={async (reason, targetId) => {
          const res = await createReportAction(targetId, 'post', reason);
          if (res.success) {
            setToast({ message: res.message || 'Reporte enviado a moderación.', type: 'success' });
          } else {
            setToast({ message: res.error || 'Error al enviar el reporte.', type: 'error' });
          }
        }}
      />
    </article>
  );
}

export interface PostListProps {
  posts: UnifiedPost[];
  onSelectPost?: (id: string) => void;
  currentUserId?: string | null;
}

export default function PostList({ posts, onSelectPost, currentUserId }: PostListProps) {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  if (posts.length === 0) {
    return (
      <div className="p-8 sm:p-10 bg-pure-white rounded-[20px] sm:rounded-[30px] text-center">
        <p className="font-candal font-normal text-tiny sm:text-p text-alpha-black">
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
    <div className="space-y-4 sm:space-y-5">
      {query && (
        <p className="font-candal font-normal text-tiny text-alpha-black px-4 sm:px-8 py-1">
          Resultados de búsqueda para: <span className="font-open-sans font-extrabold text-main-black">&quot;{query}&quot;</span>
        </p>
      )}
      <div className="space-y-4 sm:space-y-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} onSelectPost={onSelectPost} currentUserId={currentUserId} />
        ))}
      </div>
    </div>
  );
}