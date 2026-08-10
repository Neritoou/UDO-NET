import type { Metadata } from 'next'
import { LoginView } from '@module_1/auth/components/LoginView'

export const metadata: Metadata = {
  title: 'Iniciar sesión | UdoNET',
  description: 'Entra a UdoNET con tu cuenta de Google.',
}

/**
 * Página de acceso. Solo renderiza el componente del Módulo 1.
 *
 * `error` lo pone `/auth/callback` cuando el retorno desde Google falla.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string; error?: string }>
}) {
  const { redirectTo, error } = await searchParams

  return <LoginView redirectTo={redirectTo} error={error} />
}
