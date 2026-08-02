'use client';

import { useState } from 'react';

const REPORT_REASONS = [
  'Lenguaje que incita al odio',
  'Acoso, bullying o abuso',
  'Contenido sexual',
  'Spam o contenido engañoso',
  'Terrorismo',
  'Contenido violento o desagradable',
  'Discriminación',
  'Suicidio, fomentación del suicidio',
  'Información falsa',
] as const;

export interface ReportModalProps {
  isOpen: boolean;
  targetId: string;
  targetType: 'post' | 'reply' | 'user' | 'community';
  onClose: () => void;
  onSubmitReport: (reason: string, targetId: string) => Promise<void> | void;
}

export function ReportModal({
  isOpen,
  targetId,
  onClose,
  onSubmitReport,
}: ReportModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSelectReason = async (reason: string) => {
    try {
      setIsSubmitting(true);
      await onSubmitReport(reason, targetId);
      onClose();
    } catch (error) {
      console.error('Error al enviar el reporte:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-md rounded-3xl bg-[#EFEFEF] p-6 shadow-2xl transition-all">
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute right-5 top-5 rounded-full p-1 text-black hover:bg-black/10 transition-colors"
          aria-label="Cerrar ventana emergente"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="3"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="mb-4">
          <h2 className="text-xl font-bold text-black">Reportar</h2>
          <p className="mt-1 text-xs font-semibold text-neutralGray">
            ¿Por qué quieres reportar esta publicación?
          </p>
        </div>

        <hr className="mb-3 border-t border-gray-300" />

        <div className="flex flex-col divide-y divide-gray-200/60 max-h-[60vh] overflow-y-auto">
          {REPORT_REASONS.map((reason) => (
            <button
              key={reason}
              onClick={() => handleSelectReason(reason)}
              disabled={isSubmitting}
              className="flex items-center justify-between py-3.5 text-left text-xs font-bold text-black transition-colors hover:bg-black/5 rounded-lg px-2"
            >
              <span>{reason}</span>
              <svg
                className="h-5 w-5 text-mainBlue flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}