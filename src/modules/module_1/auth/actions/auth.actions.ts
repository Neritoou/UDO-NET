'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { signInWithGoogle, signOut } from '../services/auth-service'
import type { AuthFormState } from '../types'

/**
 * Server Actions de autenticación.
 *
 * Solo quedan dos: entrar con Google y salir. No hay validación de campos
 * porque no hay campos: el formulario de login es un único botón, y las
 * credenciales las gestiona Google.
 */

/** Ruta a la que se envía al usuario tras iniciar sesión si no se indica otra. */
const DEFAULT_REDIRECT = '/'

/**
 * Valida el destino de la redirección posterior al login.
 *
 * Se rechaza cualquier valor que no sea una ruta interna para evitar redirigir
 * al usuario a un dominio externo desde un enlace manipulado.
 */
function resolveRedirectTo(value: FormDataEntryValue | null): string {
  if (typeof value !== 'string') return DEFAULT_REDIRECT

  const path = value.trim()
  if (!path.startsWith('/') || path.startsWith('//')) return DEFAULT_REDIRECT

  return path
}

/**
 * Resuelve la URL base de la aplicación para armar la dirección de retorno.
 *
 * Se lee de las cabeceras de la petición en vez de fijarla en una constante,
 * para que funcione igual en local, en previsualizaciones y en producción.
 */
async function getSiteOrigin(): Promise<string> {
  const requestHeaders = await headers()

  const origin = requestHeaders.get('origin')
  if (origin) return origin

  const host = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host')
  const protocol = requestHeaders.get('x-forwarded-proto') ?? 'http'

  return host ? `${protocol}://${host}` : ''
}

/**
 * Inicia el flujo de OAuth con Google.
 *
 * No abre la sesión aquí: envía al usuario a Google, que lo devolverá a
 * `/auth/callback`, donde el código se canjea por la sesión. Solo devuelve un
 * estado cuando algo falla antes de salir de la aplicación.
 */
export async function loginWithGoogleAction(
  prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const redirectTo = resolveRedirectTo(formData.get('redirectTo'))

  const origin = await getSiteOrigin()
  if (!origin) return { error: 'No se pudo iniciar el acceso con Google. Inténtalo de nuevo.' }

  const callbackUrl = `${origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`

  const result = await signInWithGoogle(callbackUrl)
  if ('error' in result) return { error: result.error }

  // `redirect` lanza una excepción interna de Next.js: nada de lo que venga
  // después se ejecuta, y por eso no hace falta un `return`.
  redirect(result.url)
}

/** Cierra la sesión del usuario y lo devuelve a la página de inicio de sesión. */
export async function logoutAction(): Promise<void> {
  await signOut()

  revalidatePath('/', 'layout')
  redirect('/login')
}
