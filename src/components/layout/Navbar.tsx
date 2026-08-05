import Link from 'next/link'
import Image from 'next/image'
import { getCurrentUser } from '@module_1/auth/exports'
import { getUserNotifications } from '@module_4/notifications/exports'
import { NavbarClient } from './NavbarClient'

/** Barra de navegación superior fija. */
export async function Navbar() {
  const user = await getCurrentUser()
  const notifications = user ? await getUserNotifications(user.id) : []

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-14 bg-pure-white border-b border-white-gray">
      <div className="relative flex h-full items-center justify-between px-4 sm:px-6">
        <Link href="/" className="shrink-0 flex items-center z-10">
          <Image
            src="/isologo-udonet.png"
            alt="UdoNET"
            width={36}
            height={36}
            className="rounded-full"
          />
        </Link>

        <NavbarClient user={user} initialNotifications={notifications} />
      </div>
    </header>
  )
}