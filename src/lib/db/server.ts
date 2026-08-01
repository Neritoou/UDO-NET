import { createServerClient } from '@supabase/ssr'
import type { CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Crea y retorna un cliente de Supabase configurado para el lado del servidor (Server Components y Server Actions).
 *
 * Utiliza la API de cookies de Next.js para leer y escribir las cookies de sesión de Supabase.
 * El bloque `setAll` se encierra en un try/catch porque en los Server Components de solo lectura
 * intentar escribir cookies lanza un error que debe ignorarse silenciosamente.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Se ignoran los errores en Server Components de solo lectura donde no se pueden escribir cookies.
          }
        },
      },
    }
  )
}
