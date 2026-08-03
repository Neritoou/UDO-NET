import { createClient } from '@/lib/db/server'

/**
 * Capa de acceso a Supabase Auth.
 *
 * Solo se ejecuta en el servidor: todas las funciones usan el cliente de
 * `@/lib/db/server`, que lee y escribe la sesión en las cookies de la petición.
 * Ningún componente cliente debe importar este archivo.
 */

/** Identidad mínima devuelta por Supabase Auth. */
export type AuthIdentity = {
  id: string
  email: string
  /**
   * Nombre de usuario que se eligió al registrarse y todavía no se ha aplicado
   * al perfil. Ver `PENDING_USERNAME_KEY`.
   */
  pendingUsername: string | null
}

/**
 * Clave donde se guarda el nombre elegido en el registro.
 *
 * Hace falta porque, si el proyecto exige confirmar el correo, al registrarse
 * todavía no hay sesión y no se puede escribir en la tabla `users`. El nombre
 * viaja en los metadatos de Auth y se aplica en el primer inicio de sesión.
 */
const PENDING_USERNAME_KEY = 'pending_username'

/**
 * Traduce los errores de Supabase Auth a mensajes en español.
 *
 * Supabase devuelve los mensajes en inglés y sin código estable, por eso se
 * comparan fragmentos del texto en minúsculas en lugar de un código de error.
 */
function translateAuthError(message: string): string {
  const normalized = message.toLowerCase()

  if (normalized.includes('invalid login credentials')) {
    return 'El correo o la contraseña son incorrectos.'
  }
  if (normalized.includes('email not confirmed')) {
    return 'Debes confirmar tu correo antes de iniciar sesión.'
  }
  if (normalized.includes('user already registered') || normalized.includes('already been registered')) {
    return 'Ya existe una cuenta registrada con ese correo.'
  }
  if (normalized.includes('should be different')) {
    return 'La contraseña nueva debe ser distinta de la anterior.'
  }
  if (normalized.includes('password should be')) {
    return 'La contraseña no cumple con los requisitos mínimos de seguridad.'
  }
  if (normalized.includes('auth session missing') || normalized.includes('session_not_found')) {
    return 'Tu enlace de recuperación caducó. Solicita uno nuevo.'
  }
  if (normalized.includes('rate limit') || normalized.includes('too many requests')) {
    return 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.'
  }

  return 'No se pudo completar la operación. Inténtalo de nuevo.'
}

/**
 * Devuelve la identidad del usuario autenticado en la petición actual.
 * Retorna `null` si no hay sesión activa o si el token no es válido.
 */
export async function getAuthIdentity(): Promise<AuthIdentity | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user?.email) return null

  const pending = data.user.user_metadata?.[PENDING_USERNAME_KEY]

  return {
    id: data.user.id,
    email: data.user.email,
    pendingUsername: typeof pending === 'string' && pending.length > 0 ? pending : null,
  }
}

/** Borra el nombre pendiente una vez aplicado, para no reescribirlo en cada sesión. */
export async function clearPendingUsername(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.updateUser({ data: { [PENDING_USERNAME_KEY]: null } })
}

/** Devuelve solo el id del usuario autenticado, o `null` si no hay sesión. */
export async function getAuthUserId(): Promise<string | null> {
  const identity = await getAuthIdentity()
  return identity?.id ?? null
}

/** Inicia sesión con correo y contraseña. La sesión queda guardada en cookies. */
export async function signInWithPassword(
  email: string,
  password: string
): Promise<{ userId: string; email: string } | { error: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { error: translateAuthError(error.message) }
  if (!data.user?.email) return { error: 'No se pudo iniciar sesión. Inténtalo de nuevo.' }

  return { userId: data.user.id, email: data.user.email }
}

/**
 * Registra una cuenta nueva en Supabase Auth.
 *
 * `hasSession` es `false` cuando el proyecto exige confirmar el correo: en ese
 * caso el usuario existe pero todavía no puede navegar autenticado.
 */
export async function signUpWithPassword(
  email: string,
  password: string,
  username: string
): Promise<{ userId: string; hasSession: boolean } | { error: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // `username` es por si el proyecto tiene un trigger que crea la fila de
      // `users` y lee ese campo; `pending_username` es nuestro respaldo para
      // aplicarlo en el primer inicio de sesión si el trigger lo ignoró.
      data: { username, [PENDING_USERNAME_KEY]: username },
    },
  })

  if (error) return { error: translateAuthError(error.message) }
  if (!data.user) return { error: 'No se pudo crear la cuenta. Inténtalo de nuevo.' }

  return { userId: data.user.id, hasSession: data.session !== null }
}

/** Cierra la sesión actual y limpia las cookies de autenticación. */
export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
}

/**
 * Envía el correo con el enlace para restablecer la contraseña.
 *
 * `redirectTo` debe ser una URL absoluta y estar en la lista de URLs
 * permitidas del proyecto de Supabase, o el enlace del correo no funcionará.
 */
export async function sendPasswordResetEmail(
  email: string,
  redirectTo: string
): Promise<{ error: string } | null> {
  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })

  if (error) return { error: translateAuthError(error.message) }
  return null
}

/**
 * Canjea el token del correo de recuperación por una sesión temporal.
 *
 * Solo puede llamarse desde un Route Handler: es la única parte de Next.js que
 * puede escribir las cookies de sesión al atender el clic desde el correo.
 */
export async function verifyRecoveryToken(
  tokenHash: string
): Promise<{ error: string } | null> {
  const supabase = await createClient()
  const { error } = await supabase.auth.verifyOtp({
    type: 'recovery',
    token_hash: tokenHash,
  })

  if (error) return { error: 'El enlace no es válido o ya caducó. Solicita uno nuevo.' }
  return null
}

/** Cambia la contraseña del usuario con sesión activa. */
export async function updateUserPassword(
  password: string
): Promise<{ error: string } | null> {
  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) return { error: translateAuthError(error.message) }
  return null
}
