import type { Metadata } from 'next'
import { ForgotPasswordView } from '@module_1/auth/components/ForgotPasswordView'

export const metadata: Metadata = {
  title: 'Recuperar contraseña | UdoNET',
  description: 'Te enviamos un enlace para restablecer tu contraseña.',
}

/** Página para solicitar el correo de recuperación. */
export default function ForgotPasswordPage() {
  return <ForgotPasswordView />
}
