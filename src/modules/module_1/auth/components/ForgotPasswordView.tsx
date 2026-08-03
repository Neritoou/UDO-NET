import { redirect } from 'next/navigation'
import { getCurrentUserId } from '../services/session-service'
import { AuthCard } from './AuthCard'
import { ForgotPasswordForm } from './ForgotPasswordForm'

/**
 * Pantalla para solicitar el correo de recuperación.
 * Server Component: con sesión activa no tiene sentido recuperar nada.
 */
export async function ForgotPasswordView() {
  const userId = await getCurrentUserId()
  if (userId) redirect('/profile')

  return (
    <AuthCard>
      <ForgotPasswordForm />
    </AuthCard>
  )
}
