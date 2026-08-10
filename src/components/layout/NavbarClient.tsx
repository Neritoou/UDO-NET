'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import type { User } from '@/lib/types'
import type { Notification } from '@/lib/types/notification'
import { UserAvatar } from '@module_1/profiles/exports.client'
import { LogoutButton } from '@module_1/auth/exports.client'
import { NotificationDropdown } from '@module_4/notifications/exports.client'

export function NavbarClient({
  user,
  initialNotifications,
}: {
  user: User | null
  initialNotifications: Notification[]
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Cerrar menú al click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <>
      {/* Acciones del usuario */}
      <div className="flex items-center gap-2 shrink-0 ml-auto z-10">

        {user ? (
          <>
            {/* Notificaciones */}
            <NotificationDropdown initialNotifications={initialNotifications} />

            {/* Avatar con menú */}
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="rounded-full transition hover:ring-2 hover:ring-main-blue border-0 bg-transparent cursor-pointer"
              >
                <UserAvatar avatarUrl={user.avatar_url} username={user.username} size="sm" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-pure-white p-2 shadow-lg ring-1 ring-white-gray">
                  <div className="px-3 py-2 border-b border-white-gray mb-1">
                    <p className="text-tiny font-candal text-main-black truncate">{user.username}</p>
                    <p className="text-extra-tiny text-gray-custom truncate">{user.email}</p>
                  </div>

                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-tiny text-main-black hover:bg-lite-white transition"
                  >
                    Mi perfil
                  </Link>

                  <Link
                    href="/profile/edit"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-tiny text-main-black hover:bg-lite-white transition"
                  >
                    Editar perfil
                  </Link>

                  <div className="border-t border-white-gray mt-1 pt-1">
                    <LogoutButton className="w-full rounded-lg px-3 py-2 text-tiny text-left text-deep-orange hover:bg-lite-white transition" />
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link
            href="/login"
            className="rounded-full bg-main-orange px-4 py-1.5 text-tiny font-candal text-pure-white hover:bg-deep-orange transition"
          >
            Iniciar sesión
          </Link>
        )}
      </div>
    </>
  )
}