import Link from 'next/link'
import { getCurrentUserId } from '../services/session-service'
import { candal } from '../../fonts'
import { UDO_STYLES } from '../../theme'
import { AuthCard } from './AuthCard'
import { UpdatePasswordForm } from './UpdatePasswordForm'

/**
 * Pantalla para escribir la contraseña nueva.
 *
 * Server Component: el enlace del correo deja una sesión temporal abierta. Si
 * no la hay, el enlace caducó o se entró a la URL directamente, así que se
 * muestra el aviso en vez del formulario.
 */
export async function UpdatePasswordView() {
  const userId = await getCurrentUserId()

  if (!userId) {
    return (
      <AuthCard>
        <div className="flex flex-col">
          <h1 className={`${candal.className} mb-2 text-2xl font-black leading-tight text-black md:text-3xl`}>
            Enlace no válido
          </h1>
          <p className="mb-8 text-sm text-gray-700">
            El enlace caducó o ya fue usado. Solicita uno nuevo para cambiar tu contraseña.
          </p>

          <Link
            href="/forgot-password"
            className={`${UDO_STYLES.primaryButton} block w-full text-center`}
          >
            Solicitar otro enlace
          </Link>

          <Link
            href="/login"
            className={`${UDO_STYLES.secondaryButton} mt-3 block text-center`}
          >
            Volver al inicio de sesión
          </Link>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard>
      <UpdatePasswordForm />
    </AuthCard>
  )
}
