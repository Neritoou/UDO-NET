import type { Metadata } from 'next'
import { LoginView } from '@module_1/auth/components/LoginView'

export const metadata: Metadata = {
  title: 'Iniciar sesión | UdoNET',
  description: 'Entra a UdoNET con tu correo institucional.',
}

/** Página de inicio de sesión. Solo renderiza el componente del Módulo 1. */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>
}) {
  const { redirectTo } = await searchParams

  return <LoginView redirectTo={redirectTo} />
}
