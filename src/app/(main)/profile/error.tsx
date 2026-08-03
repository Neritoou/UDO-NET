'use client'

import { ProfileErrorState } from '@module_1/profiles/exports.client'

/** Límite de error de la sección de perfil. Next.js exige que sea un componente cliente. */
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return <ProfileErrorState reset={reset} />
}
