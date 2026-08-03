import { NextResponse, type NextRequest } from 'next/server'
import { verifyRecoveryToken } from '@module_1/auth/exports'

/**
 * Atiende el enlace del correo de recuperación de contraseña.
 *
 * Es un Route Handler y no un Server Action porque el usuario llega aquí
 * haciendo clic en un enlace (petición GET), y porque canjear el token exige
 * escribir la cookie de sesión: los Server Components no pueden hacerlo.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)

  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/update-password'

  if (!tokenHash || type !== 'recovery') {
    return NextResponse.redirect(`${origin}/update-password`)
  }

  const result = await verifyRecoveryToken(tokenHash)

  // Sin sesión válida, `UpdatePasswordView` ya muestra el aviso de enlace caducado.
  if (result) return NextResponse.redirect(`${origin}/update-password`)

  return NextResponse.redirect(`${origin}${next}`)
}
