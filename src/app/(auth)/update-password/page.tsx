import type { Metadata } from 'next'
import { UpdatePasswordView } from '@module_1/auth/components/UpdatePasswordView'

export const metadata: Metadata = {
  title: 'Nueva contraseña | UdoNET',
  description: 'Elige una contraseña nueva para tu cuenta.',
}

/** Página donde el usuario escribe su contraseña nueva tras abrir el enlace del correo. */
export default function UpdatePasswordPage() {
  return <UpdatePasswordView />
}
