import ReportsPanel from "@module_5/components/ReportsPanel";
import { createClient } from "@/lib/db/server";

export const metadata = {
  title: "Moderación - Reportes",
};

export default async function ModerationPage() {
  // Comprobar que las variables de entorno estén definidas
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-2xl rounded-xl bg-white p-6 shadow">
          <h1 className="text-xl font-candal text-[#1E3B70]">Faltan variables de entorno</h1>
          <p className="mt-2 text-sm text-gray-600">
            Para usar la sección de moderación debes configurar tu conexión a Supabase.
            Crea un archivo <strong>.env.local</strong> en la raíz del proyecto con las siguientes variables:
          </p>
          <pre className="mt-3 rounded bg-gray-100 p-3 text-sm">NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-public-key</pre>
          <p className="mt-3 text-sm text-gray-600">Después reinicia el servidor de desarrollo.</p>
        </div>
      </main>
    );
  }

  const supabase = await createClient();

  // Obtener usuario desde la sesión
  let user: any = null;
  try {
    const { data: userData } = await supabase.auth.getUser();
    user = (userData as any)?.user;
  } catch (e) {
    // ignore
  }

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-2xl rounded-xl bg-white p-6 shadow">
          <h1 className="text-xl font-candal text-[#1E3B70]">Acceso no autorizado</h1>
          <p className="mt-2 text-sm text-gray-600">Necesitas iniciar sesión como moderador o administrador para ver esta página.</p>
        </div>
      </main>
    );
  }

  // Obtener rol desde tabla users
  const { data: userRec, error: userRecError } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userRecError) {
    console.error("Failed to fetch user record:", userRecError);
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-2xl rounded-xl bg-white p-6 shadow">
          <h1 className="text-xl font-candal text-[#1E3B70]">Error interno</h1>
          <p className="mt-2 text-sm text-gray-600">No se pudo verificar tu rol. Revisa la consola del servidor.</p>
        </div>
      </main>
    );
  }

  const role = (userRec as any)?.role;
  if (!["admin", "moderator"].includes(role)) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-2xl rounded-xl bg-white p-6 shadow">
          <h1 className="text-xl font-candal text-[#1E3B70]">Acceso denegado</h1>
          <p className="mt-2 text-sm text-gray-600">No tienes permisos suficientes para acceder a esta sección.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[url('/defaults/udonet-bg.jpg')] bg-cover p-8">
      <div className="mx-auto max-w-5xl rounded-2xl bg-white/90 p-6 shadow-lg">
        <ReportsPanel />
      </div>
    </main>
  );
}
