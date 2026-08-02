import { candal } from '../../fonts'

/**
 * Contenedor de las pantallas de autenticación.
 *
 * Reproduce la tarjeta del prototipo: formulario a la izquierda (40%) y panel
 * de marca con el logo a la derecha (60%), sobre la foto del arco de la UDO con
 * un velo azul institucional. Es un Server Component porque solo maqueta.
 */
export function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/udo-arch.jpg')" }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(15, 39, 72, 0.82)' }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-4 w-full max-w-5xl py-10">
        <div className="flex min-h-[600px] w-full flex-col overflow-hidden rounded-3xl bg-white shadow-2xl lg:flex-row">
          {/* ── Columna izquierda: formulario ── */}
          <div className="flex w-full flex-col justify-center bg-[#f4f6f9] p-8 md:p-10 lg:w-[40%]">
            {children}
          </div>

          {/* ── Columna derecha: marca ── */}
          <div className="flex h-full w-full flex-col items-center justify-between px-8 pb-16 pt-10 md:px-10 lg:min-h-[600px] lg:w-[60%] bg-[#e6f0fa]">
            <div className="flex w-full justify-center">
              {/* Se usa <img> para no depender de la configuración de dominios de next/image. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-udonet.png"
                alt="Logo de UDO Net"
                className="h-auto w-[350px] max-w-full object-contain mix-blend-multiply"
              />
            </div>

            <div className="mt-auto w-full px-4 text-center md:px-8">
              <p className={`${candal.className} text-base font-black leading-snug text-black`}>
                ¡Ten la bienvenida a UDONET,
                <br />
                una red social hecha por y
                <br />
                para estudiantes!
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
