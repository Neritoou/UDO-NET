import type { Metadata } from 'next'
import { ProfileView } from '@module_1/profiles/components/ProfileView'

export const metadata: Metadata = {
  title: 'Mi perfil | UdoNET',
  description: 'Gestiona los datos de tu perfil en UdoNET.',
}

/** Página del perfil propio. Server Component: los datos se piden dentro de ProfileView. */
export default function MyProfilePage() {
  return <ProfileView />
}
