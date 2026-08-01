import type { Metadata } from 'next'
import { RegisterView } from '@module_1/auth/components/RegisterView'

export const metadata: Metadata = {
  title: 'Crear cuenta | UdoNET',
  description: 'Regístrate en UdoNET y únete a la comunidad de la UDO.',
}

/** Página de registro. Solo renderiza el componente del Módulo 1. */
export default function RegisterPage() {
  return <RegisterView />
}
