import { redirect } from 'next/navigation'

/**
 * El registro por separado ya no existe: con Google la cuenta se crea sola la
 * primera vez que alguien entra. La ruta se conserva para que los enlaces y
 * marcadores antiguos no den 404.
 */
export default function RegisterPage() {
  redirect('/login')
}
