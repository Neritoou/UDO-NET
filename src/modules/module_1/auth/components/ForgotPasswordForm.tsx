'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { candal } from '../../fonts'
import { UDO_STYLES } from '../../theme'
import { requestPasswordResetAction } from '../actions/auth.actions'
import { INITIAL_AUTH_STATE } from '../types'
import { AuthField } from './AuthField'

/**
 * Formulario para pedir el correo de recuperación de contraseña.
 * El Server Action responde igual exista o no la cuenta, para no filtrar correos.
 */
export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    requestPasswordResetAction,
    INITIAL_AUTH_STATE
  )

  return (
    <form action={formAction} className="flex flex-col" noValidate>
      <div className="mb-8">
        <h1 className={`${candal.className} mb-2 text-2xl font-black leading-tight text-black md:text-3xl`}>
          ¿Olvidaste tu
          <br />
          contraseña?
        </h1>
        <p className={`${candal.className} text-sm font-bold text-gray-700 md:text-base`}>
          Te enviamos un enlace
          <br />
          a tu correo
        </p>
      </div>

      <AuthField
        id="forgot-email"
        name="email"
        label="Correo electrónico"
        type="email"
        placeholder="Ingrese su correo..."
        autoComplete="email"
        error={state.fieldErrors?.email}
      />

      {state.error ? (
        <p role="alert" className={`${UDO_STYLES.errorBox} mt-4`}>
          {state.error}
        </p>
      ) : null}

      {state.message ? (
        <p role="status" className={`${UDO_STYLES.successBox} mt-4`}>
          {state.message}
        </p>
      ) : null}

      <div className="mt-6">
        <button
          type="submit"
          disabled={isPending}
          className={`${UDO_STYLES.primaryButton} w-full`}
        >
          {isPending ? 'Enviando...' : 'Enviar enlace'}
        </button>
      </div>

      <span className="mb-2 mt-10 block text-center text-xs font-bold text-black">
        ¿Ya la recordaste?
      </span>

      <Link href="/login" className={`${UDO_STYLES.secondaryButton} block text-center`}>
        Iniciar sesión
      </Link>
    </form>
  )
}
