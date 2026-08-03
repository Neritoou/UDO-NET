'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Community, UserRole } from '@/lib/types'

export function SidebarClient({
  communities,
  isAuthenticated,
  userRole,
}: {
  communities: Community[]
  isAuthenticated: boolean
  userRole: UserRole | null
}) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const close = () => setMobileOpen(false)
  const canModerate = userRole === 'moderator' || userRole === 'admin'

  return (
    <>
      {/* Botón hamburguesa en móvil */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed bottom-4 left-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-main-orange text-pure-white shadow-lg lg:hidden"
        aria-label="Abrir menú"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
          {mobileOpen ? (
            <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
          ) : (
            <path fillRule="evenodd" d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
          )}
        </svg>
      </button>

      {/* Overlay móvil */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-main-black/40 lg:hidden"
          onClick={close}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-14 left-0 z-40 h-[calc(100vh-3.5rem)] w-56 bg-pure-white border-r border-white-gray overflow-y-auto transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <nav className="flex flex-col p-3 gap-0.5">
          {/* Navegación principal */}
          <SidebarLink href="/" label="Principal" icon={<HomeIcon />} active={pathname === '/'} onClick={close} />
          <SidebarLink href="/communities" label="Comunidades" icon={<CommunityIcon />} active={pathname.startsWith('/communities')} onClick={close} />
          <SidebarLink href="/notifications" label="Notificaciones" icon={<BellIcon />} active={pathname.startsWith('/notifications')} onClick={close} />

          {/* Moderación — solo visible para moderadores y admins */}
          {canModerate && (
            <SidebarLink href="/moderation" label="Moderación" icon={<ShieldIcon />} active={pathname.startsWith('/moderation')} onClick={close} />
          )}

          {/* Comunidades del usuario */}
          {isAuthenticated && communities.length > 0 && (
            <>
              <div className="my-2 border-t border-white-gray" />
              <p className="px-3 mb-1 text-extra-tiny font-open-sans text-gray-custom uppercase tracking-wider">
                Mis comunidades
              </p>

              {communities.map((community) => {
                const href = `/communities/${community.slug}`
                const isActive = pathname.startsWith(href)

                return (
                  <Link
                    key={community.id}
                    href={href}
                    onClick={close}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2 transition ${
                      isActive
                        ? 'bg-gray-blue text-dark-main-blue'
                        : 'text-main-black hover:bg-lite-white'
                    }`}
                  >
                    <img
                      src={community.icon_url ?? '/defaults/community_icon.svg'}
                      alt={community.name}
                      className="h-6 w-6 rounded-full object-cover bg-lite-white"
                    />
                    <span className="text-tiny truncate">{community.name}</span>
                  </Link>
                )
              })}
            </>
          )}
        </nav>
      </aside>
    </>
  )
}

/** Link reutilizable del sidebar. */
function SidebarLink({
  href,
  label,
  icon,
  active,
  onClick,
}: {
  href: string
  label: string
  icon: React.ReactNode
  active: boolean
  onClick: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-tiny transition ${
        active
          ? 'bg-gray-blue text-dark-main-blue font-candal'
          : 'text-main-black hover:bg-lite-white'
      }`}
    >
      {icon}
      {label}
    </Link>
  )
}

// --- Iconos SVG ---

function HomeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 shrink-0">
      <path d="M11.47 3.841a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.061l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.689z" />
      <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15.75a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.432z" />
    </svg>
  )
}

function CommunityIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 shrink-0">
      <path d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 shrink-0">
      <path fillRule="evenodd" d="M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0 24.585 24.585 0 01-4.831-1.244.75.75 0 01-.298-1.205A8.217 8.217 0 005.25 9.75V9zm4.502 8.9a2.25 2.25 0 004.496 0 25.057 25.057 0 01-4.496 0z" clipRule="evenodd" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 shrink-0">
      <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08zm3.094 8.016a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
    </svg>
  )
}