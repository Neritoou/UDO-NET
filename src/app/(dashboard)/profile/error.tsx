'use client'

// Se importa del barril cliente: `exports.ts` arrastra los servicios de
// servidor y no puede cargarse desde un archivo con 'use client'.
import { ProfileErrorState } from '@module_1/profiles/components/ProfileErrorState'

/** Límite de error de la sección de perfil. Next.js exige que sea un componente cliente. */
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return <ProfileErrorState reset={reset} />
}
