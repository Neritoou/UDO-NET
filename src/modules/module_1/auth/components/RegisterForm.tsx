'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { candal } from '../../fonts'
import { UDO_STYLES } from '../../theme'
import { registerAction } from '../actions/auth.actions'
import { INITIAL_AUTH_STATE } from '../types'
import { AuthField } from './AuthField'

/**
 * Formulario de registro de una cuenta nueva.
 * Toda la validación real ocurre en el Server Action `registerAction`.
 */
export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, INITIAL_AUTH_STATE)

  return (
    <form action={formAction} className="flex flex-col" noValidate>
      <div className="mb-6">
        <h1 className={`${candal.className} mb-2 text-2xl font-black leading-tight text-black md:text-3xl`}>
          Únete a
          <br />
          UDONet
        </h1>
        <p className={`${candal.className} text-sm font-bold text-gray-700 md:text-base`}>
          Regístrate para
          <br />
          empezar
        </p>
      </div>

      <div className="space-y-3">
        <AuthField
          id="register-username"
          name="username"
          label="Nombre de usuario"
          type="text"
          placeholder="Ingrese su nombre de usuario..."
          autoComplete="username"
          error={state.fieldErrors?.username}
        />

        <AuthField
          id="register-email"
          name="email"
          label="Correo electrónico"
          type="email"
          placeholder="Ingrese su correo..."
          autoComplete="email"
          error={state.fieldErrors?.email}
        />

        <AuthField
          id="register-password"
          name="password"
          label="Contraseña"
          type="password"
          placeholder="Ingrese su contraseña..."
          autoComplete="new-password"
          error={state.fieldErrors?.password}
        />

        <AuthField
          id="register-confirm-password"
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
          {isPending ? 'Creando cuenta...' : 'Registrarse'}
        </button>
      </div>

      <span className="mb-2 mt-6 block text-center text-xs font-bold text-black">
        ¿Ya tienes una cuenta?
      </span>

      <Link href="/login" className={`${UDO_STYLES.secondaryButton} block text-center`}>
        Iniciar sesión
      </Link>
    </form>
  )
}
