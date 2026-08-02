import { buildUserReputation } from '../services/badge-service'
import type { ReputationLevel } from '../types'

/** Colores de cada insignia. Se mapean aparte para no mezclar estilos con la lógica. */
const LEVEL_STYLES: Record<ReputationLevel, { container: string; icon: string; title: string; text: string }> = {
  novice: {
    container: 'border-[#e8eff8] bg-white',
    icon: 'bg-[#6b7280]',
    title: 'text-[#0f2748]',
    text: 'text-[#6b7280]',
  },
  contributor: {
    container: 'border-[#e8eff8] bg-[#e8eff8]',
    icon: 'bg-[#2563eb]',
    title: 'text-[#0f2748]',
    text: 'text-[#1a3d6b]',
  },
  expert: {
    container: 'border-[#fb923c] bg-[#fff7ed]',
    icon: 'bg-[#f97316]',
    title: 'text-[#7c2d12]',
    text: 'text-[#c2410c]',
  },
  mentor: {
    container: 'border-[#facc15] bg-[#fefce8]',
    icon: 'bg-[#facc15]',
    title: 'text-[#713f12]',
    text: 'text-[#a16207]',
  },
}

/**
 * Insignia de reputación de un usuario.
 *
 * Server Component: solo muestra datos derivados de la reputación, no necesita
 * interactividad ni estado en el cliente.
 */
export function ReputationBadge({
  userId,
  reputation,
  showProgress = false,
}: {
  userId: string
  reputation: number
  /** Muestra la barra de avance hacia la siguiente insignia. */
  showProgress?: boolean
}) {
  const { score, badge, nextBadge, progress } = buildUserReputation(userId, reputation)
  const styles = LEVEL_STYLES[badge.level]

  return (
    <div className={`flex flex-col gap-3 rounded-2xl border p-4 shadow-sm ${styles.container}`}>
      <div className="flex items-center gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl font-bold text-white ${styles.icon}`}
          aria-hidden="true"
        >
          ★
        </div>

        <div className="flex flex-col">
          <h4 className={`text-sm font-bold leading-tight ${styles.title}`}>
            {badge.title} · {score} pts
          </h4>
          <p className={`text-xs ${styles.text}`}>{badge.description}</p>
        </div>
      </div>

      {showProgress && nextBadge ? (
        <div className="flex flex-col gap-1.5">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white">
            <div className={`h-full rounded-full ${styles.icon}`} style={{ width: `${progress}%` }} />
          </div>
          <p className={`text-xs ${styles.text}`}>
            Faltan {nextBadge.minReputation - score} puntos para {nextBadge.title}.
          </p>
        </div>
      ) : null}
    </div>
  )
}
