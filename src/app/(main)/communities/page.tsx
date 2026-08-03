import { GetCommunitiesSC } from "@module_2/communities/components/get-communities-svr";

export default function CommunitiesPage() {
  return (
    <main className="min-h-screen bg-gray-blue p-4 sm:p-8">
      <div className="max-w-[1000px] mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
        <GetCommunitiesSC />
      </div>
    </main>
  );
}