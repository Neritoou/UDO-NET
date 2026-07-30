'use client';

import React, { useState, useCallback } from 'react';
import { castVote } from '../actions/votes.actions'; // 👈 Tu Server Action seguro

// 1. Iconos SVG Nativos del Design System (Enviados por el Grupo 3)
function UpvoteIcon({ active = false, className = "w-8 h-8" }: { active?: boolean; className?: string }) {
  const bgFill = active ? "#5D9CFC" : "#EEEEEE";
  const strokeColor = active ? "#FFFFFF" : "#0C0C0C";

  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill={bgFill} />
      <path d="M16 9V23M16 9L9.5 15.5M16 9L22.5 15.5" stroke={strokeColor} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DownvoteIcon({ active = false, className = "w-8 h-8" }: { active?: boolean; className?: string }) {
  const bgFill = active ? "#D13B00" : "#EEEEEE";
  const strokeColor = active ? "#FFFFFF" : "#0C0C0C";

  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill={bgFill} />
      <path d="M16 23V9M16 23L9.5 16.5M16 23L22.5 16.5" stroke={strokeColor} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface VoteManagerProps {
  replyId: string;
  initialVoteCount: number;
  currentSessionUserId: string;
  replyAuthorId: string;
}

export default function VoteManager({
  replyId,
  initialVoteCount,
  currentSessionUserId,
  replyAuthorId,
}: VoteManagerProps) {
  const [voteCount, setVoteCount] = useState<number>(initialVoteCount);
  const [currentVote, setCurrentVote] = useState<1 | -1 | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const isAuthor = currentSessionUserId === replyAuthorId;

  const showToast = useCallback((message: string, type: 'error' | 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleVote = async (value: 1 | -1) => {
    if (isAuthor || isLoading) return;

    const previousVoteCount = voteCount;
    const previousVote = currentVote;

    // --- UI Optimista ---
    let optimisticDelta: number = value;

    if (currentVote === value) {
      optimisticDelta = -value;
      setCurrentVote(null);
    } else if (currentVote !== null) {
      optimisticDelta = value * 2;
      setCurrentVote(value);
    } else {
      setCurrentVote(value);
    }

    setVoteCount((prev) => prev + optimisticDelta);
    setIsLoading(true);

    try {
      // 👈 MANTENEMOS TU SERVER ACTION (Evita usar fetch de rutas API eliminadas)
      const response = await castVote(replyId, value);

      if (!response.success) {
        setVoteCount(previousVoteCount);
        setCurrentVote(previousVote);
        showToast(response.error || 'Error al registrar el voto.', 'error');
        return;
      }

      showToast(response.message || 'Voto registrado correctamente.', 'success');
    } catch {
      setVoteCount(previousVoteCount);
      setCurrentVote(previousVote);
      showToast('Error de conexión. Intenta de nuevo.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="inline-flex items-center gap-3">
      {/* Botón Upvote con SVG del Grupo 3 */}
      <button
        type="button"
        onClick={() => handleVote(1)}
        disabled={isAuthor || isLoading}
        className={`p-0 border-0 bg-transparent transition-transform ${isAuthor ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-105'
          }`}
        title={isAuthor ? 'No puedes votar tu propio contenido' : 'Votar positivo'}
        aria-label="Upvote"
      >
        <UpvoteIcon active={currentVote === 1} className="w-8 h-8" />
      </button>

      {/* Contador numérico central */}
      <span className={`text-lg font-bold tabular-nums ${voteCount > 0 ? 'text-blue-600' : voteCount < 0 ? 'text-red-500' : 'text-gray-600'}`}>
        {voteCount}
      </span>

      {/* Botón Downvote con SVG del Grupo 3 */}
      <button
        type="button"
        onClick={() => handleVote(-1)}
        disabled={isAuthor || isLoading}
        className={`p-0 border-0 bg-transparent transition-transform ${isAuthor ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-105'
          }`}
        title={isAuthor ? 'No puedes votar tu propio contenido' : 'Votar negativo'}
        aria-label="Downvote"
      >
        <DownvoteIcon active={currentVote === -1} className="w-8 h-8" />
      </button>

      {/* Toast de feedback */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-2xl px-5 py-3 text-sm font-bold text-white shadow-lg transition-all ${toast.type === 'error' ? 'bg-[#D13B00]' : 'bg-green-500'
            }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}