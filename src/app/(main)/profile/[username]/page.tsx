import type { Metadata } from 'next'
import { ProfileView } from '@module_1/profiles/components/ProfileView'

type ProfilePageProps = {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username } = await params

  return {
    title: `Perfil de ${username} | UdoNET`,
    description: `Perfil público de ${username} en UdoNET.`,
  }
}

/** Página del perfil público de otro usuario, en modo lectura. */
export default async function PublicProfilePage({ params }: ProfilePageProps) {
  const { username } = await params

  return <ProfileView username={username} />
}
