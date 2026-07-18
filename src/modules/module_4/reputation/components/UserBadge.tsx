'use client';

import React from 'react';

/**
 * Props del componente UserBadge.
 */
interface UserBadgeProps {
  reputation: number;
  role: string;
}

/**
 * Componente UserBadge
 *
 * Renderiza una insignia en forma de píldora que indica el rango o rol del usuario.
 * Las condiciones de renderizado son:
 * - role === 'moderator' → Píldora Azul "Profesor/Moderador"
 * - reputation > 1000 → Píldora Naranja "Alta Reputación"
 * - reputation < 0 → Píldora Roja "Baja Reputación"
 * - Default → Píldora Azul claro "Aprendiz"
 */
export default function UserBadge({ reputation, role }: UserBadgeProps) {
  const getBadgeConfig = (): { label: string; bgClass: string } => {
    if (role === 'moderator') {
      return {
        label: 'Profesor/Moderador',
        bgClass: 'bg-blue-600',
      };
    }

    if (reputation > 1000) {
      return {
        label: 'Alta Reputación',
        bgClass: 'bg-orange-500',
      };
    }

    if (reputation < 0) {
      return {
        label: 'Baja Reputación',
        bgClass: 'bg-red-500',
      };
    }

    return {
      label: 'Aprendiz',
      bgClass: 'bg-blue-400',
    };
  };

  const { label, bgClass } = getBadgeConfig();

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-white ${bgClass} shadow-sm transition-all duration-200 hover:scale-105`}
    >
      {label}
    </span>
  );
}
