'use client'

import { useTransition } from 'react'
import { logoutAction } from '../actions/auth.actions'

/**
 * Botón para cerrar la sesión.
 * Se expone en el barril para que cualquier módulo pueda colocarlo en su cabecera.
 */
export function LogoutButton({ className }: { className?: string }) {
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    startTransition(async () => {
      await logoutAction()
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={
        className ??
        'rounded-full border border-[#e8eff8] bg-[#e8eff8] px-4 py-2 text-sm font-semibold text-[#0f2748] transition-all duration-200 hover:opacity-80 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60'
      }
    >
      {isPending ? 'Saliendo...' : 'Cerrar sesión'}
    </button>
  )
}
