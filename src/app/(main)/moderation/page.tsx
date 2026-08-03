import ReportsPanel from "@module_5/reports/components/ReportsPanel"
import { getPrioritizedReports } from "@module_5/reports/exports"
import { getCurrentUser } from "@module_1/auth/exports"
import { createClient } from "@/lib/db/server"

export const metadata = {
  title: "Moderación - Reportes",
}

export default async function ModerationPage() {
  const user = await getCurrentUser()

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-2xl rounded-xl bg-white p-6 shadow">
          <h1 className="text-xl font-candal text-[#1E3B70]">Acceso no autorizado</h1>
          <p className="mt-2 text-sm text-gray-600">Necesitas iniciar sesión como moderador o administrador para ver esta página.</p>
        </div>
      </main>
    )
  }

  if (!['admin', 'moderator'].includes(user.role)) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-2xl rounded-xl bg-white p-6 shadow">
          <h1 className="text-xl font-candal text-[#1E3B70]">Acceso denegado</h1>
          <p className="mt-2 text-sm text-gray-600">No tienes permisos suficientes para acceder a esta sección.</p>
        </div>
      </main>
    )
  }

  const reports = await getPrioritizedReports()

  const postIds = reports.filter(r => r.target_type === 'post').map(r => r.target_id)
  let reportedPostsMap: Record<string, { id: string; content: string }> = {}

  if (postIds.length > 0) {
    const supabase = await createClient()
    const { data: postsData } = await supabase
      .from('posts')
      .select('id, content')
      .in('id', postIds)

    if (postsData) {
      reportedPostsMap = postsData.reduce((acc, post) => {
        acc[post.id] = post
        return acc
      }, {} as Record<string, { id: string; content: string }>)
    }
  }

  return (
    <main className="min-h-screen bg-[url('/defaults/udonet-bg.jpg')] bg-cover p-8">
      <div className="mx-auto max-w-5xl rounded-2xl bg-white/90 p-6 shadow-lg">
        <ReportsPanel initialReports={reports} reportedPosts={reportedPostsMap} />
      </div>
    </main>
  )
}