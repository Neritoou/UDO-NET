import { revalidatePath } from 'next/cache'
import { NextResponse, type NextRequest } from 'next/server'
import { completeGoogleSignIn } from '@module_1/auth/exports'

/**
 * Atiende el retorno desde Google tras aceptar el acceso.
 *
 * Es un Route Handler y no un Server Action porque Google devuelve al usuario
 * con una petición GET, y porque canjear el código exige escribir la cookie de
 * sesión: los Server Components no pueden hacerlo.
 */

/** Envía de vuelta al login mostrando el motivo del fallo. */
function backToLogin(origin: string, message: string) {
  return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(message)}`)
}

/**
 * Resuelve el origen real de la aplicación.
 *
 * En producción hay un proxy delante, así que el host de `request.url` es el
 * interno; se prefiere `x-forwarded-host`, que es el que ve el usuario.
 */
function resolveOrigin(request: NextRequest, fallbackOrigin: string): string {
  const forwardedHost = request.headers.get('x-forwarded-host')
  if (!forwardedHost || process.env.NODE_ENV === 'development') return fallbackOrigin

  const protocol = request.headers.get('x-forwarded-proto') ?? 'https'
  return `${protocol}://${forwardedHost}`
}

export async function GET(request: NextRequest) {
  const { searchParams, origin: requestOrigin } = new URL(request.url)
  const origin = resolveOrigin(request, requestOrigin)

  // Solo se admiten rutas internas: `next` viaja por la URL y podría venir
  // manipulado para sacar al usuario del sitio.
  const next = searchParams.get('next') ?? '/'
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/'

  // Google añade `error` cuando el usuario cancela o rechaza el permiso.
  if (searchParams.get('error')) {
    return backToLogin(origin, 'No se completó el acceso con Google. Inténtalo de nuevo.')
  }

  const code = searchParams.get('code')
  if (!code) {
    return backToLogin(origin, 'El enlace de acceso no es válido. Inténtalo de nuevo.')
  }

  const result = await completeGoogleSignIn(code)
  if (result) return backToLogin(origin, result.error)

  // El layout muestra el usuario de la sesión: sin esto seguiría pintando la
  // versión anterior, la de visitante.
  revalidatePath('/', 'layout')

  return NextResponse.redirect(`${origin}${safeNext}`)
}
