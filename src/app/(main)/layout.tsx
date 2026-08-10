import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { ScrollToTop } from '@/components/layout/ScrollToTop'
import { CreatePostProvider } from '@module_3/exports'
import { getAllCommunities } from '@module_2/communities/exports'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const communities = await getAllCommunities()

  return (
    <CreatePostProvider communities={communities}>
      <ScrollToTop />
      <Navbar />
      <Sidebar />
      <main className="pt-14 lg:pl-56 min-h-screen">
        {children}
      </main>
    </CreatePostProvider>
  )
}