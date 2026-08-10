/**
 * Esqueleto de carga de la pantalla de acceso.
 * Mantiene la tarjeta de dos columnas para que no salte al cargar el formulario.
 */
export function AuthSkeleton() {
  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0f2748]"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Cargando...</span>

      <div className="relative z-10 mx-4 w-full max-w-5xl py-10">
        <div className="flex min-h-[600px] w-full animate-pulse flex-col overflow-hidden rounded-3xl bg-white shadow-2xl lg:flex-row">
          <div className="flex w-full flex-col justify-center gap-4 bg-[#f4f6f9] p-8 md:p-10 lg:w-[40%]">
            <div className="h-8 w-40 rounded bg-gray-200" />
            <div className="mb-4 h-4 w-32 rounded bg-gray-200" />

            {/* Botón de acceso con Google */}
            <div className="h-11 rounded-full bg-gray-200" />

            <div className="mx-auto mt-2 h-3 w-48 rounded bg-gray-200" />
          </div>

          <div className="w-full bg-[#e6f0fa] lg:min-h-[600px] lg:w-[60%]" />
        </div>
      </div>
    </main>
  )
}
