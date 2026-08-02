'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { getThread } from '@module_3/posts/actions/thread';
import { addReplyAction } from '@module_3/posts/actions/reply';
import VoteManager from '@module_4/votes/components/VoteManager';
import UserBadge from '@module_4/reputation/components/UserBadge';
import { UnifiedPost, DatabaseReply } from '@module_3/posts/services/supabase-service';
import UserAvatar from '../../components/UserAvatar';
import Toast from '../../components/Toast';
import { ChevronLeftIcon } from '../../components/icons';
import { PostCard } from './PostList';

interface ThreadViewProp {
  threadId: string;
  initialThread: UnifiedPost | null;
  onBack: () => void;
}

const MockUsers = ['Alejandro', 'Joyce_Valerio', 'Dano', 'Keiber'];

interface MentionTextareaProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
}

function MentionTextarea({ value, onChange, placeholder, rows = 3, disabled }: MentionTextareaProps) {
  const [showMentions, setShowMentions] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [cursorPos, setCursorPos] = useState(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const pos = e.target.selectionStart;
    onChange(val);
    setCursorPos(pos);

    const textBeforeCursor = val.slice(0, pos);
    const lastAtPos = textBeforeCursor.lastIndexOf('@');

    if (lastAtPos !== -1) {
      const charAfterAt = textBeforeCursor.slice(lastAtPos + 1);
      if (!/\s/.test(charAfterAt)) {
        setFilterText(charAfterAt.toLowerCase());
        setShowMentions(true);
        return;
      }
    }
    setShowMentions(false);
  };

  const insertMention = (username: string) => {
    const textBeforeCursor = value.slice(0, cursorPos);
    const lastAtPos = textBeforeCursor.lastIndexOf('@');
    const textAfterCursor = value.slice(cursorPos);

    const newText = value.slice(0, lastAtPos) + `@${username} ` + textAfterCursor;
    onChange(newText);
    setShowMentions(false);
  };

  const filteredUsers = MockUsers.filter(u => u.toLowerCase().includes(filterText));

  return (
    <div className="relative w-full">
      <textarea
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className="w-full p-3 rounded-[18px] bg-lite-white border border-white-gray font-candal font-normal text-p text-main-black placeholder:text-alpha-black focus:outline-none focus:border-regular-blue transition-colors resize-none"
      />
      {showMentions && filteredUsers.length > 0 && (
        <div className="absolute left-0 bottom-full mb-1 w-48 bg-pure-white border border-white-gray rounded-[16px] shadow-lg z-50 overflow-hidden font-candal font-normal">
          <div className="px-3 py-1.5 text-extra-tiny text-alpha-black border-b border-white-gray">
            Mencionar usuario...
          </div>
          {filteredUsers.map(user => (
            <button
              key={user}
              type="button"
              onClick={() => insertMention(user)}
              className="w-full text-left px-3 py-2 text-tiny text-main-black hover:bg-regular-blue hover:text-pure-white transition-colors cursor-pointer border-0 bg-transparent"
            >
              @{user}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const renderTextWithMentions = (text: string) => {
  const mentionRegex = /(@[\w_]+)/g;
  const parts = text.split(mentionRegex);

  return parts.map((part, index) => {
    if (part.startsWith('@')) {
      return (
        <span key={index} className="text-regular-blue font-open-sans font-extrabold cursor-pointer hover:underline">
          {part}
        </span>
      );
    }
    return <span key={index}>{part}</span>;
  });
};

interface ReplyItemProps {
  reply: DatabaseReply;
  postId: string;
  onAddReply: () => void;
  onShowToast: (msg: string, type: 'success' | 'error') => void;
  parentAuthorName?: string;
}

function ReplyItem({ reply, postId, onAddReply, onShowToast, parentAuthorName }: ReplyItemProps) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    startTransition(async () => {
      const res = await addReplyAction(postId, reply.id, replyContent);
      if (res.success) {
        setReplyContent('');
        setShowReplyBox(false);
        onShowToast('¡Respuesta guardada con éxito!', 'success');
        onAddReply();
      } else {
        onShowToast(res.error || 'Error al guardar la respuesta.', 'error');
      }
    });
  };

  return (
    <div className="bg-pure-white rounded-[24px] p-5 font-candal font-normal min-w-0 transition-all border-0">
      {/* Cabecera del Autor (usuario • fecha en una misma línea) */}
      <div className="flex items-center gap-2 mb-2 font-candal font-normal text-tiny text-alpha-black flex-wrap">
        <UserAvatar avatarUrl={reply.author?.avatar_url} username={reply.author?.username || 'Anónimo'} size="w-7 h-7" />
        <strong className="text-main-black font-candal font-normal text-p">
          {reply.author?.username || 'Anónimo'}
        </strong>
        <span>•</span>
        <span>{new Date(reply.created_at).toLocaleDateString()}</span>

        {parentAuthorName && (
          <span className="text-extra-tiny font-candal font-normal text-alpha-black ml-1">
            Respondiendo a <span className="text-regular-blue font-open-sans font-extrabold">@{parentAuthorName}</span>
          </span>
        )}
      </div>

      {/* Contenido con break-words obligatorio */}
      <div className="my-3 font-candal font-normal text-p text-lite-black whitespace-pre-wrap leading-relaxed break-words overflow-hidden">
        {renderTextWithMentions(reply.content)}
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-4 text-tiny font-candal font-normal pt-1">
        <VoteManager 
          replyId={reply.id}
          initialVoteCount={reply.vote_count || 0}
          currentSessionUserId="00000000-0000-0000-0000-000000000001"
          replyAuthorId={reply.user_id || reply.author?.id || ''}
        />

        <button 
          type="button"
          onClick={() => setShowReplyBox(!showReplyBox)} 
          className="text-regular-blue hover:text-dark-main-blue font-candal font-normal cursor-pointer transition-colors bg-transparent border-0"
        >
          {showReplyBox ? 'Cancelar' : 'Responder'}
        </button>
      </div>

      {/* Caja para Responder */}
      {showReplyBox && (
        <form onSubmit={handleSubmitReply} className="mt-4 pt-3 border-t border-white-gray flex flex-col gap-2">
          <MentionTextarea
            value={replyContent}
            onChange={setReplyContent}
            placeholder={`Respondiendo a ${reply.author?.username || 'Anónimo'}...`}
            rows={2}
            disabled={isPending}
          />
          <div className="flex justify-end gap-2">
            <button 
              type="button"
              onClick={() => setShowReplyBox(false)}
              className="px-3.5 py-1.5 bg-lite-white hover:bg-white-gray text-main-black rounded-full text-tiny font-candal font-normal cursor-pointer border-0"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={!replyContent.trim() || isPending}
              className="px-4 py-1.5 bg-regular-blue hover:bg-dark-main-blue disabled:opacity-50 text-pure-white border-0 rounded-full text-tiny font-candal font-normal cursor-pointer transition-all"
            >
              {isPending ? 'Enviando...' : 'Enviar Respuesta'}
            </button>
          </div>
        </form>
      )}

      {/* Respuestas Hijas (Rediseño Estilo Threads/Twitter) */}
      {reply.nestedReplies && reply.nestedReplies.length > 0 && (
        <div className="mt-4 pl-3 sm:pl-4 border-l-2 border-regular-blue/30 space-y-3">
          {reply.nestedReplies.map((child) => (
            <ReplyItem
              key={child.id}
              reply={child}
              postId={postId}
              onAddReply={onAddReply}
              onShowToast={onShowToast}
              parentAuthorName={reply.author?.username || 'Anónimo'}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ThreadView({ threadId, initialThread, onBack }: ThreadViewProp) {
  const router = useRouter();
  const [thread, setThread] = useState<UnifiedPost | null>(initialThread);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const [showMainReplyBox, setShowMainReplyBox] = useState(false);
  const [mainReplyContent, setMainReplyContent] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleTagClick = (tag: string) => {
    const cleanTag = tag.replace('#', '');
    router.push(`/?q=${encodeURIComponent(cleanTag)}`);
  };

  // Only used to refresh replies after posting — not for initial load
  const loadData = async () => {
    setLoading(true);
    const data = await getThread(threadId);
    setThread(data);
    setLoading(false);
  };

  const handleMainReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mainReplyContent.trim() || !thread) return;

    startTransition(async () => {
      const res = await addReplyAction(thread.id, null, mainReplyContent);
      if (res.success) {
        setMainReplyContent('');
        setShowMainReplyBox(false);
        setToast({ message: '¡Respuesta guardada con éxito!', type: 'success' });
        loadData();
      } else {
        setToast({ message: res.error || 'Error al guardar la respuesta.', type: 'error' });
      }
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3">
        <div className="w-8 h-8 border-4 border-regular-blue border-t-transparent rounded-full animate-spin"></div>
        <p className="font-candal font-normal text-p text-gray-custom">Cargando publicación...</p>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="p-10 bg-pure-white border border-white-gray rounded-[30px] text-center space-y-4 shadow-sm">
        <button 
          type="button"
          onClick={onBack} 
          className="px-4 py-2 bg-regular-blue text-pure-white rounded-full font-candal font-normal text-tiny cursor-pointer border-0"
        >
          ← Volver
        </button>
        <p className="font-candal font-normal text-p text-gray-custom">No se encontró la publicación especificada.</p>
      </div>
    );
  }

  const firstLink = thread.links && thread.links.length > 0 ? thread.links[0] : null;
  const authorName = thread.author?.username || 'Anónimo';
  const authorRole = thread.author?.role || 'Profesor';
  const communityBreadcrumb = `F / ${thread.community_name || 'DCYS'}`;

  return (
    <div className="max-w-4xl mx-auto space-y-6 relative">
      {/* Toast Notificación Elegante */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Botón de Regresar (Volver + Chevron Left + Hover Azul Regular) */}
      <button 
        type="button"
        onClick={onBack} 
        className="px-5 py-2.5 bg-pure-white hover:bg-regular-blue text-main-black hover:text-pure-white font-candal font-normal text-p rounded-full border-0 transition-all cursor-pointer flex items-center gap-2 group"
      >
        <ChevronLeftIcon className="w-5 h-5 text-main-black group-hover:text-pure-white group-hover:-translate-x-1 transition-all" />
        <span>Volver</span>
      </button>

      {/* Tarjeta Principal Reutilizable en Modo ThreadView */}
      <PostCard
        post={thread}
        isThreadView={true}
        onMainReplyClick={() => setShowMainReplyBox(!showMainReplyBox)}
        showMainReplyBox={showMainReplyBox}
        onTagClick={() => onBack()}
      />
      
      {/* Caja para Comentar al Hilo Principal */}
      {showMainReplyBox && (
        <div className="p-6 bg-pure-white rounded-[30px] border-0 space-y-3 font-candal font-normal">
          <h3 className="text-p font-candal font-normal text-main-black">Escribe tu respuesta al hilo principal</h3>
          <form onSubmit={handleMainReplySubmit}>
            <MentionTextarea
              value={mainReplyContent}
              onChange={setMainReplyContent}
              placeholder="¿Qué opinas al respecto? Usa @ para mencionar..."
              rows={3}
              disabled={isPending}
            />
            <div className="flex justify-end gap-3 mt-3">
              <button 
                type="button"
                onClick={() => setShowMainReplyBox(false)}
                className="px-5 py-2 bg-lite-white hover:bg-white-gray text-main-black font-candal font-normal rounded-full text-tiny cursor-pointer border-0 transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={!mainReplyContent.trim() || isPending}
                className="px-5 py-2 bg-regular-blue hover:bg-dark-main-blue disabled:opacity-50 text-pure-white font-candal font-normal rounded-full text-tiny cursor-pointer border-0 transition-all"
              >
                {isPending ? 'Publicando...' : 'Publicar Respuesta'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sección del Árbol de Respuestas */}
      <div className="space-y-4 pt-4 font-candal font-normal">
        <h2 className="text-h4 font-candal font-normal text-main-black">
          Respuestas ({thread.replies ? thread.replies.length : 0})
        </h2>

        {thread.replies && thread.replies.length > 0 ? (
          <div className="space-y-3">
            {thread.replies.map((reply) => (
              <ReplyItem 
                key={reply.id} 
                reply={reply} 
                postId={thread.id} 
                onAddReply={loadData}
                onShowToast={(msg, type) => setToast({ message: msg, type })}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 bg-pure-white rounded-[24px] border-0 text-center">
            <p className="font-candal font-normal text-p text-gray-custom">
              Aún no hay respuestas en esta publicación. ¡Sé el primero en responder!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}