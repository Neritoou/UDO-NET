'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { candal } from '../../fonts'
import { UDO_STYLES } from '../../theme'
import { loginAction } from '../actions/auth.actions'
import { INITIAL_AUTH_STATE } from '../types'
import { AuthField } from './AuthField'

/**
 * Formulario de inicio de sesión.
 *
 * Envía los datos al Server Action `loginAction`; `useActionState` conserva los
 * errores devueltos por el servidor y expone el estado de envío sin `useState`.
 */
export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [state, formAction, isPending] = useActionState(loginAction, INITIAL_AUTH_STATE)

  return (
    <form action={formAction} className="flex flex-col" noValidate>
      <input type="hidden" name="redirectTo" value={redirectTo ?? '/'} />

      <div className="mb-8">
        <h1 className={`${candal.className} mb-2 text-2xl font-black leading-tight text-black md:text-3xl`}>
          Exprésate,
          <br />
          Infórmate
        </h1>
        <p className={`${candal.className} text-sm font-bold text-gray-700 md:text-base`}>
          Inicia sesión para
          <br />
          empezar
        </p>
      </div>

      <div className="space-y-4">
        <AuthField
          id="login-email"
          name="email"
          label="Correo electrónico"
          type="email"
          placeholder="Ingrese su correo..."
          autoComplete="email"
          error={state.fieldErrors?.email}
        />

        <AuthField
          id="login-password"
          name="password"
          label="Contraseña"
          type="password"
          placeholder="Ingrese su contraseña..."
          autoComplete="current-password"
          error={state.fieldErrors?.password}
        />
      </div>

      {state.error ? (
        <p role="alert" className={`${UDO_STYLES.errorBox} mt-4`}>
          {state.error}
        </p>
      ) : null}

      <div className="mt-6 flex items-center justify-between">
        <button type="submit" disabled={isPending} className={UDO_STYLES.primaryButton}>
          {isPending ? 'Entrando...' : 'Iniciar'}
        </button>

        <Link href="/forgot-password" className="text-xs font-bold text-blue-400 hover:underline">
          Recuperar contraseña
        </Link>
      </div>

      <span className="mb-2 mt-10 block text-center text-xs font-bold text-black">
        ¿No tienes una cuenta?
      </span>

      <Link href="/register" className={`${UDO_STYLES.secondaryButton} block text-center`}>
        Registrarse
      </Link>
    </form>
  )
}
