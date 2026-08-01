import { AuthSkeleton } from '@module_1/auth/components/AuthSkeleton'

/** UI que Next.js muestra mientras se verifica la sesión antes de pintar el registro. */
export default function Loading() {
  return <AuthSkeleton />
}
