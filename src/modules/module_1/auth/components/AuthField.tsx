import { openSans } from '../../fonts'
import { UDO_STYLES } from '../../theme'

/**
 * Campo de texto de los formularios de autenticación.
 *
 * No usa estado propio: el valor viaja en el `FormData` del formulario hasta el
 * Server Action, por eso basta con `name` y el error devuelto por el servidor.
 */
export function AuthField({
  id,
  name,
  label,
  type,
  placeholder,
  autoComplete,
  defaultValue,
  error,
}: {
  id: string
  name: string
  label: string
  type: 'text' | 'email' | 'password'
  placeholder: string
  autoComplete?: string
  defaultValue?: string
  error?: string
}) {
  return (
    <div>
      <label htmlFor={id} className={`${UDO_STYLES.label} mb-1`}>
        {label}
      </label>

      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${UDO_STYLES.input} ${openSans.className}`}
      />

      {error ? (
        <p id={`${id}-error`} className={`${UDO_STYLES.fieldError} mt-1 px-4`}>
          {error}
        </p>
      ) : null}
    </div>
  )
}
