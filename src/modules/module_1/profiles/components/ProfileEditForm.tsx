'use client'

import { useActionState } from 'react'
import { UDO_STYLES } from '../../theme'
import { updateProfileAction } from '../actions/profile.actions'
import type { User } from '@/lib/types'
import { INITIAL_PROFILE_STATE } from '../types'

/** Longitud máxima de la biografía, igual a la validada en el Server Action. */
const MAX_BIO_LENGTH = 300

/**
 * Formulario de edición del perfil propio.
 *
 * El Server Action toma el id del usuario de la sesión, por eso el formulario
 * no envía ningún identificador: solo los campos editables.
 */
export function ProfileEditForm({ profile }: { profile: User }) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, INITIAL_PROFILE_STATE)

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <div>
        <label htmlFor="username" className={`${UDO_STYLES.label} mb-1.5`}>
          Nombre de usuario
        </label>
        <input
          id="username"
          name="username"
          type="text"
          defaultValue={profile.username}
          className={UDO_STYLES.input}
        />
        {state.fieldErrors?.username ? (
          <p className={`${UDO_STYLES.fieldError} mt-1.5`}>{state.fieldErrors.username}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="bio" className={`${UDO_STYLES.label} mb-1.5`}>
          Biografía
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          maxLength={MAX_BIO_LENGTH}
          defaultValue={profile.bio ?? ''}
          placeholder="Cuéntale al foro qué estudias y en qué puedes ayudar..."
          className={`${UDO_STYLES.input} resize-none`}
        />
        {state.fieldErrors?.bio ? (
          <p className={`${UDO_STYLES.fieldError} mt-1.5`}>{state.fieldErrors.bio}</p>
        ) : null}
      </div>

      <label className="flex items-start gap-3 rounded-xl border-2 border-[#e8eff8] bg-[#f9fafb] p-3">
        <input
          id="is_public"
          name="is_public"
          type="checkbox"
          defaultChecked={profile.is_public}
          className="mt-0.5 h-4 w-4 accent-[#2563eb]"
        />
        <span className="flex flex-col">
          <span className="text-sm font-semibold text-[#0f2748]">Perfil público</span>
          <span className="text-xs text-[#6b7280]">
            Si lo desactivas, tu correo dejará de mostrarse a otros usuarios.
          </span>
        </span>
      </label>

      {state.error ? (
        <p role="alert" className={UDO_STYLES.errorBox}>
          {state.error}
        </p>
      ) : null}

      {state.message ? (
        <p role="status" className={UDO_STYLES.successBox}>
          {state.message}
        </p>
      ) : null}

      <button type="submit" disabled={isPending} className={UDO_STYLES.primaryButton}>
        {isPending ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  )
}
