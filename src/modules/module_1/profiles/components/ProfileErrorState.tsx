'use client'

import { UDO_STYLES } from '../../theme'

/**
 * Pantalla de error de la sección de perfil.
 *
 * Debe ser un componente cliente porque `error.tsx` de Next.js le pasa la
 * función `reset` para reintentar el renderizado sin recargar toda la página.
 */
export function ProfileErrorState({ reset }: { reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f3f4f6] px-4">
      <div className={`${UDO_STYLES.card} flex max-w-md flex-col items-center gap-4 text-center`}>
        <div
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e8eff8] text-2xl"
          aria-hidden="true"
        >
          !
        </div>

        <div>
          <h1 className="text-lg font-bold text-[#0f2748]">No pudimos cargar el perfil</h1>
          <p className="mt-1 text-sm text-[#6b7280]">
            Puede ser un problema temporal de conexión con el servidor. Inténtalo de nuevo.
          </p>
        </div>

        <button type="button" onClick={reset} className={UDO_STYLES.primaryButton}>
          Reintentar
        </button>
      </div>
    </main>
  )
}
