import { AuthSkeleton } from '@module_1/auth/components/AuthSkeleton'

/** UI que Next.js muestra mientras se verifica la sesión temporal del enlace. */
export default function Loading() {
  return <AuthSkeleton />
}
