/**
 * Tipos propios del submódulo de autenticación.
 *
 * El usuario de la sesión es el tipo `User` de `@/lib/types`: no se define un
 * alias ni una copia, para que todos los módulos hablen del mismo contrato.
 */

/**
 * Estado que el Server Action de acceso devuelve al formulario.
 * Se consume con `useActionState` en el componente cliente.
 *
 * No hay errores por campo: el único formulario es un botón, y las
 * credenciales las valida Google.
 */
export type AuthFormState = {
  /** Motivo por el que no se pudo iniciar sesión, listo para mostrar. */
  error?: string
}

/** Estado inicial del formulario de acceso. */
export const INITIAL_AUTH_STATE: AuthFormState = {}
