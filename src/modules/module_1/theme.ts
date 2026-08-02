/**
 * Sistema de diseño del Módulo 1.
 *
 * Los tokens replican los del prototipo de frontend del equipo. Se definen aquí
 * y no en `globals.css` porque ese archivo está fuera de la carpeta del módulo
 * y solo los integradores pueden modificarlo. Cuando los tokens se muevan a
 * `globals.css`, basta con reemplazar los hex por `var(--color-*)`.
 */
export const UDO_COLORS = {
  mainBlue: '#1a3d6b',
  darkMainBlue: '#0f2748',
  regularBlue: '#2563eb',
  grayBlue: '#e8eff8',
  linkColor: '#3b82f6',
  deepOrange: '#ea580c',
  mainOrange: '#f97316',
  mainYellow: '#facc15',
  mainBlack: '#111827',
  grayCustom: '#6b7280',
  whiteGray: '#f3f4f6',
  liteWhite: '#f9fafb',
  pureWhite: '#ffffff',
  /* Panel del formulario de autenticación */
  formPanel: '#f4f6f9',
  /* Panel de branding de autenticación */
  brandPanel: '#e6f0fa',
  /* Relleno del botón secundario */
  softBlue: '#dbeafe',
  /* Texto del botón secundario */
  deepIndigo: '#1e3a8a',
} as const

/** Clases reutilizables para no repetir la misma cadena de utilidades en cada campo. */
export const UDO_STYLES = {
  /** Tarjeta blanca con borde suave, usada en perfil y autenticación. */
  card: 'rounded-2xl border border-gray-200 bg-white p-5 shadow-sm',

  /** Etiqueta de un campo de formulario. */
  label: 'block text-xs font-black text-black',

  /** Input redondeado del formulario de autenticación. */
  input:
    'h-10 w-full rounded-full border border-blue-400 bg-blue-50/50 px-4 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500',

  /** Textarea con el mismo lenguaje visual que el input, pero con esquinas suaves. */
  textarea:
    'w-full resize-none rounded-2xl border border-blue-400 bg-blue-50/50 px-4 py-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500',

  /** Botón principal de acción. */
  primaryButton:
    'rounded-full bg-[#3b82f6] px-8 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-400',

  /** Botón secundario, para acciones alternativas. */
  secondaryButton:
    'w-full rounded-full bg-[#dbeafe] py-2 text-sm font-bold text-[#1e3a8a] transition-colors hover:bg-blue-200 disabled:cursor-not-allowed disabled:opacity-60',

  /** Mensaje de error general de un formulario. */
  errorBox: 'rounded-2xl bg-red-50 px-4 py-2 text-sm text-red-700',

  /** Mensaje de éxito de un formulario. */
  successBox: 'rounded-2xl bg-green-50 px-4 py-2 text-sm text-green-700',

  /** Error asociado a un campo concreto. */
  fieldError: 'text-xs font-bold text-[#ea580c]',
} as const
