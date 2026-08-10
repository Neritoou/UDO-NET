import { redirect } from 'next/navigation'
import { getCurrentUserId } from '../services/session-service'
import { AuthCard } from './AuthCard'
import { LoginForm } from './LoginForm'

/**
 * Pantalla de acceso. Única puerta de entrada al foro: no hay registro aparte,
 * la cuenta se crea al entrar con Google por primera vez.
 *
 * Server Component: consulta la sesión en el servidor y, si el usuario ya está
 * autenticado, lo saca de aquí antes de renderizar nada.
 */
export async function LoginView({
  redirectTo,
  error,
}: {
  redirectTo?: string
  error?: string
}) {
  const userId = await getCurrentUserId()
  if (userId) redirect(redirectTo ?? '/')

  return (
    <AuthCard>
      <LoginForm redirectTo={redirectTo} error={error} />
    </AuthCard>
  )
}
