import { createClient } from '@/lib/db/server'

/**
 * Capa de acceso a Supabase Auth.
 *
 * La única forma de entrar al foro es con una cuenta de Google (OAuth). No hay
 * contraseñas propias: Supabase guarda la identidad y nosotros solo canjeamos
 * el código que devuelve Google por una sesión en cookies.
 *
 * Solo se ejecuta en el servidor: todas las funciones usan el cliente de
 * `@/lib/db/server`, que lee y escribe la sesión en las cookies de la petición.
 * Ningún componente cliente debe importar este archivo.
 */

/** Identidad mínima devuelta por Supabase Auth. */
export type AuthIdentity = {
  id: string
  email: string
  /** Nombre completo tal como lo comparte Google, o `null` si no vino. */
  fullName: string | null
  /** Foto de la cuenta de Google, o `null` si no tiene. */
  avatarUrl: string | null
}

/**
 * Traduce los errores de Supabase Auth a mensajes en español.
 *
 * Supabase devuelve los mensajes en inglés y sin código estable, por eso se
 * comparan fragmentos del texto en minúsculas en lugar de un código de error.
 */
function translateAuthError(message: string): string {
  const normalized = message.toLowerCase()

  if (normalized.includes('provider is not enabled') || normalized.includes('unsupported provider')) {
    return 'El inicio de sesión con Google no está habilitado. Avisa a un administrador.'
  }
  if (normalized.includes('redirect') && normalized.includes('not allowed')) {
    return 'La dirección de retorno no está autorizada en el servidor. Avisa a un administrador.'
  }
  if (normalized.includes('rate limit') || normalized.includes('too many requests')) {
    return 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.'
  }

  return 'No se pudo completar la operación. Inténtalo de nuevo.'
}

/**
 * Lee el primer valor de texto disponible entre varias claves de los metadatos.
 *
 * Google no siempre manda las mismas: el nombre llega como `full_name` o
 * `name`, y la foto como `avatar_url` o `picture`, según la cuenta.
 */
function readMetadata(metadata: Record<string, unknown> | undefined, keys: string[]): string | null {
  for (const key of keys) {
    const value = metadata?.[key]
    if (typeof value === 'string' && value.length > 0) return value
  }
  return null
}

/**
 * Devuelve la identidad del usuario autenticado en la petición actual.
 * Retorna `null` si no hay sesión activa o si el token no es válido.
 */
export async function getAuthIdentity(): Promise<AuthIdentity | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user?.email) return null

  const metadata = data.user.user_metadata

  return {
    id: data.user.id,
    email: data.user.email,
    fullName: readMetadata(metadata, ['full_name', 'name']),
    avatarUrl: readMetadata(metadata, ['avatar_url', 'picture']),
  }
}

/** Devuelve solo el id del usuario autenticado, o `null` si no hay sesión. */
export async function getAuthUserId(): Promise<string | null> {
  const identity = await getAuthIdentity()
  return identity?.id ?? null
}

/**
 * Prepara el inicio de sesión con Google y devuelve la URL a la que hay que
 * enviar al usuario.
 *
 * No redirige por su cuenta: quien la llame decide cómo navegar.
 *
 * (!) Solo puede llamarse desde un Server Action o un Route Handler. El flujo
 * PKCE guarda un verificador en una cookie, y un Server Component no puede
 * escribir cookies: desde ahí el canje posterior del código fallaría.
 *
 * `callbackUrl` debe ser absoluta y estar en las *Redirect URLs* del proyecto
 * de Supabase, o Google devolverá al usuario con un error.
 */
export async function signInWithGoogle(
  callbackUrl: string
): Promise<{ url: string } | { error: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: callbackUrl,
      // Fuerza el selector de cuentas en lugar de entrar con la última sesión
      // de Google del navegador: en un laboratorio se comparte la computadora.
      queryParams: { prompt: 'select_account' },
    },
  })

  if (error) return { error: translateAuthError(error.message) }
  if (!data.url) return { error: 'No se pudo conectar con Google. Inténtalo de nuevo.' }

  return { url: data.url }
}

/**
 * Canjea el código que devuelve Google por una sesión guardada en cookies.
 *
 * Solo puede llamarse desde un Route Handler: es la única parte de Next.js que
 * puede escribir las cookies de sesión al atender el retorno desde Google.
 */
export async function exchangeCodeForSession(
  code: string
): Promise<{ error: string } | null> {
  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return { error: 'No se pudo completar el inicio de sesión con Google. Inténtalo de nuevo.' }
  }
  return null
}

/** Cierra la sesión actual y limpia las cookies de autenticación. */
export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
}
