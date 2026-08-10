'use client'

import { useState, useTransition } from 'react'
import { deleteAccountAction } from '../actions/profile.actions'

/**
 * Botón para eliminar la cuenta con modal de confirmación.
 *
 * Requiere escribir "ELIMINAR" para confirmar — previene clicks accidentales.
 */
export function DeleteAccountButton() {
  const [showModal, setShowModal] = useState(false)
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const canConfirm = confirmation === 'ELIMINAR'

  const handleDelete = () => {
    if (!canConfirm || isPending) return

    startTransition(async () => {
      const result = await deleteAccountAction()
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  const handleClose = () => {
    setShowModal(false)
    setConfirmation('')
    setError(null)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="w-full rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition hover:border-red-400 hover:bg-red-100"
      >
        Eliminar mi cuenta
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-2 text-lg font-bold text-red-600">
              ¿Eliminar tu cuenta?
            </h3>
            <p className="mb-4 text-sm text-gray-600">
              Esta acción es <strong>permanente e irreversible</strong>. Se eliminarán
              todos tus datos: publicaciones, respuestas, votos, comunidades y tu perfil.
            </p>

            <p className="mb-2 text-sm text-gray-700">
              Escribe <strong>ELIMINAR</strong> para confirmar:
            </p>
            <input
              type="text"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder="ELIMINAR"
              className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              autoComplete="off"
            />

            {error && (
              <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isPending}
                className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={!canConfirm || isPending}
                className="flex-1 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? 'Eliminando...' : 'Eliminar cuenta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}