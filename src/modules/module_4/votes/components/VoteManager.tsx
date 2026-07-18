'use client';

import React, { useState, useCallback } from 'react';

/**
 * Props del componente VoteManager.
 */
interface VoteManagerProps {
  replyId: string;
  initialVoteCount: number;
  currentSessionUserId: string;
  replyAuthorId: string;
}

/**
 * Componente VoteManager
 *
 * Implementa un sistema de votación con UI Optimista:
 * - Al hacer clic, el conteo se actualiza visualmente de inmediato.
 * - Si la API retorna error (ej. auto-voto), se revierte el estado visual.
 * - Si el usuario es el autor, los botones están deshabilitados.
 */
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

  /**
   * Muestra un toast temporal que desaparece después de 3 segundos.
   */
  const showToast = useCallback((message: string, type: 'error' | 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  /**
   * Maneja la acción de votar (upvote o downvote).
   * Implementa UI optimista: actualiza visualmente primero y revierte si falla.
   */
  const handleVote = async (value: 1 | -1) => {
    if (isAuthor || isLoading) return;

    // Guardar estado previo para posible rollback
    const previousVoteCount = voteCount;
    const previousVote = currentVote;

    // --- UI Optimista: actualizar inmediatamente ---
    let optimisticDelta: number = value;

    if (currentVote === value) {
      // Si hace clic en el mismo botón, se elimina el voto
      optimisticDelta = -value;
      setCurrentVote(null);
    } else if (currentVote !== null) {
      // Si cambia de upvote a downvote (o viceversa), el delta es doble
      optimisticDelta = value * 2;
      setCurrentVote(value);
    } else {
      setCurrentVote(value);
    }

    setVoteCount((prev) => prev + optimisticDelta);
    setIsLoading(true);

    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentSessionUserId,
        },
        body: JSON.stringify({ replyId, value }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // --- Revertir estado optimista ---
        setVoteCount(previousVoteCount);
        setCurrentVote(previousVote);

        showToast(errorData.error || 'Error al registrar el voto.', 'error');
        return;
      }

      showToast('Voto registrado correctamente.', 'success');
    } catch {
      // --- Revertir estado optimista en caso de error de red ---
      setVoteCount(previousVoteCount);
      setCurrentVote(previousVote);
      showToast('Error de conexión. Intenta de nuevo.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="inline-flex flex-col items-center gap-1">
      {/* Botón Upvote */}
      <button
        onClick={() => handleVote(1)}
        disabled={isAuthor || isLoading}
        className={`group flex h-9 w-9 items-center justify-center rounded-2xl transition-all duration-200
          ${isAuthor
            ? 'cursor-not-allowed opacity-50'
            : currentVote === 1
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-500 hover:bg-blue-100 hover:text-blue-600'
          }`}
        title={isAuthor ? 'No puedes votar tu propio contenido' : 'Votar positivo'}
        aria-label="Upvote"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-5 w-5 transition-transform duration-200 group-hover:scale-110"
        >
          <path
            fillRule="evenodd"
            d="M11.47 7.72a.75.75 0 011.06 0l7.5 7.5a.75.75 0 11-1.06 1.06L12 9.31l-6.97 6.97a.75.75 0 01-1.06-1.06l7.5-7.5z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Contador de votos */}
      <span
        className={`text-lg font-bold tabular-nums transition-colors duration-200
          ${voteCount > 0
            ? 'text-blue-600'
            : voteCount < 0
              ? 'text-red-500'
              : 'text-gray-600'
          }`}
      >
        {voteCount}
      </span>

      {/* Botón Downvote */}
      <button
        onClick={() => handleVote(-1)}
        disabled={isAuthor || isLoading}
        className={`group flex h-9 w-9 items-center justify-center rounded-2xl transition-all duration-200
          ${isAuthor
            ? 'cursor-not-allowed opacity-50'
            : currentVote === -1
              ? 'bg-red-500 text-white shadow-md'
              : 'bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-500'
          }`}
        title={isAuthor ? 'No puedes votar tu propio contenido' : 'Votar negativo'}
        aria-label="Downvote"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-5 w-5 transition-transform duration-200 group-hover:scale-110"
        >
          <path
            fillRule="evenodd"
            d="M12.53 16.28a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 14.69l6.97-6.97a.75.75 0 111.06 1.06l-7.5 7.5z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Toast de feedback */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 animate-[fadeIn_0.3s_ease-out] rounded-2xl px-5 py-3 text-sm font-bold text-white shadow-lg transition-all
            ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
