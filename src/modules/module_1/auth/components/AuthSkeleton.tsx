/**
 * Esqueleto de carga de las pantallas de autenticación.
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

            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="flex flex-col gap-1.5">
                <div className="h-3 w-32 rounded bg-gray-200" />
                <div className="h-10 rounded-full bg-blue-50" />
              </div>
            ))}

            <div className="mt-4 h-9 w-28 rounded-full bg-blue-200" />
            <div className="mt-8 h-9 rounded-full bg-[#dbeafe]" />
          </div>

          <div className="w-full bg-[#e6f0fa] lg:min-h-[600px] lg:w-[60%]" />
        </div>
      </div>
    </main>
  )
}
