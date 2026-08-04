'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import type { User } from '@/lib/types'
import type { Notification } from '@/lib/types/notification'
import { UserAvatar } from '@module_1/profiles/exports.client'
import { LogoutButton } from '@module_1/auth/exports.client'
import { NotificationDropdown } from '@module_4/notifications/exports.client'

import { useRouter } from 'next/navigation'

export function NavbarClient({
  user,
  initialNotifications,
}: {
  user: User | null
  initialNotifications: Notification[]
}) {
  const router = useRouter()
  const [headerSearch, setHeaderSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleHeaderSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (headerSearch.trim()) {
      router.push(`/search?q=${encodeURIComponent(headerSearch.trim())}`)
    } else {
      router.push('/search')
    }
  }

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
      {/* Buscador Absolutamente Centrado en la ventana con breakpoints responsivos */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-130px)] max-w-[220px] xs:max-w-[280px] sm:max-w-md md:max-w-lg transition-all duration-200 z-10">
        <form onSubmit={handleHeaderSearch} className="relative w-full">
          <input
            type="text"
            value={headerSearch}
            onChange={(e) => setHeaderSearch(e.target.value)}
            placeholder="Buscar..."
            className="w-full h-9 pl-4 pr-10 rounded-full bg-[#EEEEEE] text-main-black text-xs font-bold border-0 focus:outline-none focus:ring-2 focus:ring-regular-blue placeholder:text-gray-500 shadow-inner"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-700 hover:text-main-black p-1 border-0 bg-transparent cursor-pointer"
            aria-label="Buscar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>
      </div>

      {/* Acciones del usuario fijadas en el extremo derecho */}
      <div className="flex items-center gap-2 shrink-0 ml-auto z-10">
        {user ? (
          <>
            {/* Ícono de Inicio (Home) matching la imagen de referencia */}
            <Link
              href="/"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EEEEEE] text-main-black transition-all duration-200 hover:bg-gray-300 border-0"
              title="Inicio"
              aria-label="Inicio"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-5 w-5 text-main-black"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                />
              </svg>
            </Link>

            {/* NotificationDropdown del Módulo 4 */}
            <NotificationDropdown initialNotifications={initialNotifications} />

            {/* Avatar con menú — UserAvatar y LogoutButton del Módulo 1 */}
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="rounded-full transition hover:ring-2 hover:ring-main-blue"
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