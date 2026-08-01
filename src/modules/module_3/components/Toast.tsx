"use client";

import React, { useEffect, useState } from 'react';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type = 'success', onClose, duration = 3500 }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  useEffect(() => {
    // Activar animación de entrada suave al montar
    const enterTimer = requestAnimationFrame(() => {
      setIsVisible(true);
    });

    // Iniciar desvanecimiento de salida automático
    const exitTimer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => {
      cancelAnimationFrame(enterTimer);
      clearTimeout(exitTimer);
    };
  }, [duration]);

  const styleClass = {
    success: 'bg-link-color text-pure-white border-0 shadow-xl',
    error: 'bg-deep-orange text-pure-white border-0 shadow-xl',
    info: 'bg-regular-blue text-pure-white border-0 shadow-xl',
  }[type];

  const icon = {
    success: '✨',
    error: '⚠️',
    info: 'ℹ️',
  }[type];

  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] transition-all duration-400 ease-out transform ${
        isVisible && !isExiting
          ? 'translate-y-0 opacity-100 scale-100'
          : 'translate-y-6 opacity-0 scale-95 pointer-events-none'
      }`}
    >
      <div className={`flex items-center gap-3 px-5 py-3.5 rounded-[22px] ${styleClass} font-candal font-normal text-p max-w-md`}>
        <span className="text-h4">{icon}</span>
        <span className="flex-1 text-tiny sm:text-p leading-snug font-candal font-normal text-pure-white">{message}</span>
        <button
          type="button"
          onClick={handleDismiss}
          className="text-pure-white hover:text-pure-white/80 text-p ml-2 border-0 bg-transparent cursor-pointer font-candal font-normal shrink-0 transition-opacity"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
