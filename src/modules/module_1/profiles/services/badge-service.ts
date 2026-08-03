import type { ReputationBadgeInfo, UserReputation } from '../types'

/**
 * Insignias por reputación.
 *
 * Se derivan del campo `users.reputation` en lugar de guardarse en una tabla
 * aparte, porque el esquema no define tablas de insignias y los desarrolladores
 * no pueden modificarlo. Se ordenan de mayor a menor para resolver el nivel
 * con la primera coincidencia.
 */
const BADGES: readonly ReputationBadgeInfo[] = [
  {
    level: 'mentor',
    title: 'Mentor',
    description: 'Referente de la comunidad con aportes destacados.',
    minReputation: 1500,
  },
  {
    level: 'expert',
    title: 'Experto',
    description: 'Sus respuestas resuelven dudas complejas.',
    minReputation: 500,
  },
  {
    level: 'contributor',
    title: 'Colaborador',
    description: 'Participa activamente respondiendo a sus compañeros.',
    minReputation: 100,
  },
  {
    level: 'novice',
    title: 'Novato',
    description: 'Está dando sus primeros pasos en el foro.',
    minReputation: 0,
  },
]

/** Devuelve la insignia que corresponde a una reputación dada. */
export function getBadgeForReputation(reputation: number): ReputationBadgeInfo {
  const safeScore = Math.max(0, reputation)
  const badge = BADGES.find((item) => safeScore >= item.minReputation)

  // El último elemento exige 0 de reputación, así que siempre hay coincidencia.
  return badge ?? BADGES[BADGES.length - 1]
}

/** Devuelve la siguiente insignia por alcanzar, o `null` si ya tiene la más alta. */
export function getNextBadge(reputation: number): ReputationBadgeInfo | null {
  const safeScore = Math.max(0, reputation)

  // Se recorre en orden ascendente para encontrar el primer umbral no alcanzado.
  const pending = [...BADGES].reverse().find((item) => item.minReputation > safeScore)

  return pending ?? null
}

/** Calcula el progreso (0-100) entre la insignia actual y la siguiente. */
export function getProgressToNextBadge(reputation: number): number {
  const safeScore = Math.max(0, reputation)
  const current = getBadgeForReputation(safeScore)
  const next = getNextBadge(safeScore)

  if (!next) return 100

  const span = next.minReputation - current.minReputation
  const advanced = safeScore - current.minReputation

  return Math.min(100, Math.round((advanced / span) * 100))
}

/** Construye el resumen de reputación de un usuario a partir de su puntaje. */
export function buildUserReputation(userId: string, reputation: number): UserReputation {
  const safeScore = Math.max(0, reputation)

  return {
    userId,
    score: safeScore,
    badge: getBadgeForReputation(safeScore),
    nextBadge: getNextBadge(safeScore),
    progress: getProgressToNextBadge(safeScore),
  }
}

/** Lista completa de insignias, de menor a mayor exigencia. */
export function getAllBadges(): readonly ReputationBadgeInfo[] {
  return [...BADGES].reverse()
}
