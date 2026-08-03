import type { Metadata } from 'next'
import { ProfileEditView } from '@module_1/profiles/components/ProfileEditView'

export const metadata: Metadata = {
  title: 'Editar perfil | UdoNET',
  description: 'Actualiza tu foto, tu nombre de usuario y tu biografía.',
}

/** Página de edición del perfil. Server Component que renderiza el formulario del módulo. */
export default function EditProfilePage() {
  return <ProfileEditView />
}
