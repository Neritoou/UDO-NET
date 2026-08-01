'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import {
  sendPasswordResetEmail,
  signInWithPassword,
  signOut,
  signUpWithPassword,
  updateUserPassword,
} from '../services/auth-service'
import { ensureUserProfile } from '../services/session-service'
import { isUsernameTaken } from '../../profiles/services/profile-service'
import type { AuthFormState } from '../types'

/**
 * Server Actions de autenticación.
 *
 * Reciben el `FormData` del formulario, validan en el servidor y devuelven un
 * `AuthFormState` que los componentes cliente consumen con `useActionState`.
 */

const MIN_PASSWORD_LENGTH = 8
const MIN_USERNAME_LENGTH = 3
const MAX_USERNAME_LENGTH = 20

/** Solo letras, números y guion bajo, para que el usuario sirva en URLs. */
const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Ruta a la que se envía al usuario tras iniciar sesión si no se indica otra. */
const DEFAULT_REDIRECT = '/'

/** Lee un campo de texto del formulario y lo normaliza. */
function readField(formData: FormData, name: string): string {
  const value = formData.get(name)
  return typeof value === 'string' ? value.trim() : ''
}

/**
 * Valida el destino de la redirección posterior al login.
 *
 * Se rechaza cualquier valor que no sea una ruta interna para evitar redirigir
 * al usuario a un dominio externo desde un enlace manipulado.
 */
function resolveRedirectTo(value: string): string {
  if (!value.startsWith('/') || value.startsWith('//')) return DEFAULT_REDIRECT
  return value
}

/** Inicia sesión con correo y contraseña y redirige al destino solicitado. */
export async function loginAction(
  prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = readField(formData, 'email').toLowerCase()
  const password = formData.get('password')
  const redirectTo = resolveRedirectTo(readField(formData, 'redirectTo'))

  const fieldErrors: AuthFormState['fieldErrors'] = {}
  if (!email) fieldErrors.email = 'El correo es obligatorio.'
  else if (!EMAIL_PATTERN.test(email)) fieldErrors.email = 'Ingresa un correo válido.'

  if (typeof password !== 'string' || password.length === 0) {
    fieldErrors.password = 'La contraseña es obligatoria.'
  }

  if (Object.keys(fieldErrors).length > 0) return { fieldErrors }

  const result = await signInWithPassword(email, password as string)
  if ('error' in result) return { error: result.error }

  // Cuentas creadas fuera del foro pueden no tener perfil todavía.
  await ensureUserProfile(result.userId, result.email)

  revalidatePath('/', 'layout')
  redirect(redirectTo)
}

/** Registra una cuenta nueva y crea su perfil en el foro. */
export async function registerAction(
  prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = readField(formData, 'email').toLowerCase()
  const username = readField(formData, 'username')
  const password = formData.get('password')
  const confirmPassword = formData.get('confirmPassword')

  const fieldErrors: AuthFormState['fieldErrors'] = {}

  if (!email) fieldErrors.email = 'El correo es obligatorio.'
  else if (!EMAIL_PATTERN.test(email)) fieldErrors.email = 'Ingresa un correo válido.'

  if (!username) {
    fieldErrors.username = 'El nombre de usuario es obligatorio.'
  } else if (username.length < MIN_USERNAME_LENGTH || username.length > MAX_USERNAME_LENGTH) {
    fieldErrors.username = `Debe tener entre ${MIN_USERNAME_LENGTH} y ${MAX_USERNAME_LENGTH} caracteres.`
  } else if (!USERNAME_PATTERN.test(username)) {
    fieldErrors.username = 'Solo se permiten letras, números y guion bajo.'
  }

  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    fieldErrors.password = `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`
  } else if (password !== confirmPassword) {
    fieldErrors.confirmPassword = 'Las contraseñas no coinciden.'
  }

  if (Object.keys(fieldErrors).length > 0) return { fieldErrors }

  // `null` significa que la consulta falló: no se puede descartar un duplicado,
  // así que se detiene el registro en vez de arriesgar dos usuarios iguales.
  const usernameTaken = await isUsernameTaken(username)
  if (usernameTaken === null) {
    return { error: 'No se pudo verificar el nombre de usuario. Inténtalo de nuevo.' }
  }
  if (usernameTaken) {
    return { fieldErrors: { username: 'Ese nombre de usuario ya está en uso.' } }
  }

  const result = await signUpWithPassword(email, password as string, username)
  if ('error' in result) return { error: result.error }

  const profile = await ensureUserProfile(result.userId, email, username)
  if (!profile) {
    return { error: 'La cuenta se creó, pero no se pudo guardar el perfil. Contacta a un administrador.' }
  }

  // Sin sesión activa el proyecto exige confirmar el correo antes de entrar.
  if (!result.hasSession) {
    return { message: 'Cuenta creada. Revisa tu correo para confirmarla antes de iniciar sesión.' }
  }

  revalidatePath('/', 'layout')
  redirect(DEFAULT_REDIRECT)
}

/** Cierra la sesión del usuario y lo devuelve a la página de inicio de sesión. */
export async function logoutAction(): Promise<void> {
  await signOut()

  revalidatePath('/', 'layout')
  redirect('/login')
}

/**
 * Resuelve la URL base de la aplicación para armar el enlace del correo.
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
 * Envía el correo para restablecer la contraseña.
 *
 * Responde siempre con el mismo mensaje, exista o no la cuenta, para no revelar
 * qué correos están registrados en el foro.
 */
export async function requestPasswordResetAction(
  prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = readField(formData, 'email').toLowerCase()

  if (!email) return { fieldErrors: { email: 'El correo es obligatorio.' } }
  if (!EMAIL_PATTERN.test(email)) return { fieldErrors: { email: 'Ingresa un correo válido.' } }

  const origin = await getSiteOrigin()
  if (!origin) return { error: 'No se pudo generar el enlace. Inténtalo de nuevo.' }

  const result = await sendPasswordResetEmail(email, `${origin}/auth/confirm?next=/update-password`)
  if (result) return { error: result.error }

  return {
    message: 'Si el correo está registrado, recibirás un enlace para cambiar tu contraseña.',
  }
}

/**
 * Guarda la contraseña nueva.
 *
 * Requiere la sesión temporal que crea el enlace del correo; sin ella Supabase
 * rechaza el cambio, así que no hace falta comprobar aquí quién es el usuario.
 */
export async function updatePasswordAction(
  prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const password = formData.get('password')
  const confirmPassword = formData.get('confirmPassword')

  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    return {
      fieldErrors: {
        password: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`,
      },
    }
  }

  if (password !== confirmPassword) {
    return { fieldErrors: { confirmPassword: 'Las contraseñas no coinciden.' } }
  }

  const result = await updateUserPassword(password)
  if (result) return { error: result.error }

  revalidatePath('/', 'layout')
  redirect('/profile')
}
