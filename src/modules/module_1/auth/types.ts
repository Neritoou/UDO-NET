/**
 * Tipos propios del submódulo de autenticación.
 *
 * El usuario de la sesión es el tipo `User` de `@/lib/types`: no se define un
 * alias ni una copia, para que todos los módulos hablen del mismo contrato.
 */

/** Campos de los formularios de autenticación que pueden tener un error individual. */
export type AuthField = 'email' | 'password' | 'confirmPassword' | 'username'

/**
 * Estado que los Server Actions de autenticación devuelven a los formularios.
 * Se consume con `useActionState` en los componentes cliente.
 */
export type AuthFormState = {
  /** Error general de la operación (credenciales inválidas, fallo de red, etc.). */
  error?: string
  /** Errores de validación asociados a un campo específico del formulario. */
  fieldErrors?: Partial<Record<AuthField, string>>
  /** Mensaje de éxito para flujos que no redirigen (ej. confirmación de correo). */
  message?: string
}

/** Estado inicial de los formularios de autenticación. */
export const INITIAL_AUTH_STATE: AuthFormState = {}
