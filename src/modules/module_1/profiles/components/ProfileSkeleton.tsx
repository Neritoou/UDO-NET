/**
 * Esqueleto de carga de la pantalla de perfil.
 *
 * Se muestra mientras el Server Component pide los datos a Supabase, para que
 * la pantalla no quede congelada si la consulta tarda. Reproduce la misma
 * estructura que `ProfileView` y así evitar saltos al aparecer el contenido.
 */
export function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-[#f3f4f6] px-4 py-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Cargando perfil...</span>

      <div className="mx-auto flex max-w-5xl animate-pulse flex-col gap-6">
        {/* Cabecera con portada y avatar */}
        <div className="overflow-hidden rounded-2xl border border-[#e8eff8] bg-white shadow-sm">
          <div className="h-40 bg-[#e8eff8] md:h-52" />
          <div className="flex flex-col gap-4 px-6 pb-6 md:flex-row md:items-end">
            <div className="-mt-14 h-28 w-28 rounded-full border-4 border-white bg-[#e8eff8]" />
            <div className="flex flex-col gap-2 pb-1">
              <div className="h-6 w-40 rounded bg-[#e8eff8]" />
              <div className="h-4 w-56 rounded bg-[#f3f4f6]" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Datos personales */}
          <div className="flex flex-col gap-5 lg:col-span-5">
            <div className="rounded-2xl border border-[#e8eff8] bg-white p-5 shadow-sm">
              <div className="mb-4 h-5 w-36 rounded bg-[#e8eff8]" />
              <div className="flex flex-col gap-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="flex flex-col gap-1.5">
                    <div className="h-3 w-24 rounded bg-[#f3f4f6]" />
                    <div className="h-4 w-40 rounded bg-[#e8eff8]" />
                  </div>
                ))}
              </div>
            </div>

            <div className="h-24 rounded-2xl border border-[#e8eff8] bg-white shadow-sm" />
          </div>

          {/* Formulario de edición */}
          <div className="lg:col-span-7">
            <div className="flex flex-col gap-5 rounded-2xl border border-[#e8eff8] bg-white p-5 shadow-sm">
              <div className="h-5 w-40 rounded bg-[#e8eff8]" />
              <div className="h-44 rounded-xl bg-[#f9fafb]" />
              <div className="h-12 rounded-xl bg-[#f3f4f6]" />
              <div className="h-28 rounded-xl bg-[#f3f4f6]" />
              <div className="h-12 rounded-full bg-[#e8eff8]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
