import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'UdoNET',
  description: 'Foro universitario de preguntas y respuestas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="font-candal text-main-black bg-lite-white">
        {children}
      </body>
    </html>
  )
}