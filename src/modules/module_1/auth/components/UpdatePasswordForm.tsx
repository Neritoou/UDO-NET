'use client'

import { useActionState } from 'react'
import { candal } from '../../fonts'
import { UDO_STYLES } from '../../theme'
import { updatePasswordAction } from '../actions/auth.actions'
import { INITIAL_AUTH_STATE } from '../types'
import { AuthField } from './AuthField'

/**
 * Formulario para escribir la contraseña nueva.
 * Solo funciona con la sesión temporal que abre el enlace del correo.
 */
export function UpdatePasswordForm() {
  const [state, formAction, isPending] = useActionState(updatePasswordAction, INITIAL_AUTH_STATE)

  return (
    <form action={formAction} className="flex flex-col" noValidate>
      <div className="mb-8">
        <h1 className={`${candal.className} mb-2 text-2xl font-black leading-tight text-black md:text-3xl`}>
          Nueva
          <br />
          contraseña
        </h1>
        <p className={`${candal.className} text-sm font-bold text-gray-700 md:text-base`}>
          Elige una contraseña
          <br />
          segura
        </p>
      </div>

      <div className="space-y-4">
        <AuthField
          id="new-password"
          name="password"
          label="Contraseña nueva"
          type="password"
          placeholder="Mínimo 8 caracteres..."
          autoComplete="new-password"
          error={state.fieldErrors?.password}
        />

        <AuthField
          id="new-confirm-password"
          name="confirmPassword"
          label="Repita la contraseña"
          type="password"
          placeholder="Confirme su contraseña..."
          autoComplete="new-password"
          error={state.fieldErrors?.confirmPassword}
        />
      </div>

      {state.error ? (
        <p role="alert" className={`${UDO_STYLES.errorBox} mt-4`}>
          {state.error}
        </p>
      ) : null}

      <div className="mt-6">
        <button
          type="submit"
          disabled={isPending}
          className={`${UDO_STYLES.primaryButton} w-full`}
        >
          {isPending ? 'Guardando...' : 'Guardar contraseña'}
        </button>
      </div>
    </form>
  )
}
