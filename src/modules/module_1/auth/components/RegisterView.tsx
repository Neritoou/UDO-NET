import { redirect } from 'next/navigation'
import { getCurrentUserId } from '../services/session-service'
import { AuthCard } from './AuthCard'
import { RegisterForm } from './RegisterForm'

/**
 * Pantalla de registro.
 * Server Component: si ya hay sesión activa no tiene sentido mostrarla.
 */
export async function RegisterView() {
  const userId = await getCurrentUserId()
  if (userId) redirect('/')

  return (
    <AuthCard>
      <RegisterForm />
    </AuthCard>
  )
}
