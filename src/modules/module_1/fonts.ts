import { Candal, Open_Sans } from 'next/font/google'

/**
 * Tipografías del sistema de diseño de UdoNET.
 *
 * Se cargan con `next/font` en vez de un `@import` en `globals.css` porque ese
 * archivo está fuera de la carpeta del módulo. Next.js las descarga en tiempo
 * de compilación y las sirve desde el propio dominio, así que no hay petición
 * a Google Fonts en tiempo de ejecución.
 */

/** Titulares y textos destacados. */
export const candal = Candal({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
})

/** Texto corrido y campos de formulario. */
export const openSans = Open_Sans({
  subsets: ['latin'],
  display: 'swap',
})
