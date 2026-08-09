'use client'

import { useActionState } from 'react'
import { candal } from '../../fonts'
import { UDO_STYLES } from '../../theme'
import { loginWithGoogleAction } from '../actions/auth.actions'
import { INITIAL_AUTH_STATE } from '../types'
import { GoogleLogo } from './GoogleLogo'

/**
 * Formulario de acceso con Google.
 *
 * Es un `<form>` y no un botón suelto para que el acceso funcione también sin
 * JavaScript: el Server Action recibe el envío igual y responde con la
 * redirección a Google.
 *
 * `error` es el mensaje que llega por la URL cuando el retorno desde Google
 * falla; `state.error` es el de esta misma pantalla, y por eso tiene prioridad.
 */
export function LoginForm({ redirectTo, error }: { redirectTo?: string; error?: string }) {
  const [state, formAction, isPending] = useActionState(loginWithGoogleAction, INITIAL_AUTH_STATE)

  const errorMessage = state.error ?? error

  return (
    <form action={formAction} className="flex flex-col">
      <input type="hidden" name="redirectTo" value={redirectTo ?? '/'} />

      <div className="mb-8">
        <h1 className={`${candal.className} mb-2 text-2xl font-black leading-tight text-black md:text-3xl`}>
          Exprésate,
          <br />
          Infórmate
        </h1>
        <p className={`${candal.className} text-sm font-bold text-gray-700 md:text-base`}>
          Entra con tu cuenta de
          <br />
          Google para empezar
        </p>
      </div>

      {errorMessage ? (
        <p role="alert" className={`${UDO_STYLES.errorBox} mb-4`}>
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="flex h-11 w-full items-center justify-center gap-3 rounded-full border border-gray-300 bg-white text-sm font-bold text-[#111827] transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <GoogleLogo className="h-5 w-5" />
        {isPending ? 'Conectando con Google...' : 'Continuar con Google'}
      </button>

      <p className="mt-6 text-center text-xs font-bold text-gray-600">
        Si es tu primera vez, tu cuenta de UDONet se crea sola al entrar.
      </p>
    </form>
  )
}
