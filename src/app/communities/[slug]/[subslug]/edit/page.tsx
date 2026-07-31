import { notFound, redirect } from "next/navigation";

import {
    getCommunityBySlug,
    getSubcommunityBySlug,
} from "@module_2/communities/services/community.service";

import EditSubcommunityForm from "@module_2/communities/components/edit-form";

const MOCK_USER_ID = "00000000-0000-0000-0000-000000000001";

interface PageProps {
    params: Promise<{
        slug: string;
        subslug: string;
    }>;
}

export default async function EditSubcommunityPage({ params }: PageProps) {
    const { slug, subslug } = await params;

    const parent = await getCommunityBySlug(slug);
    if (!parent) notFound();

    const subcommunity = await getSubcommunityBySlug(subslug, parent.id);
    if (!subcommunity) notFound();

    if (subcommunity.created_by !== MOCK_USER_ID) {
        redirect(`/communities/${slug}/${subslug}`);
    }

    return (
        <main className="min-h-screen bg-gray-950 text-white">
            <div className="mx-auto max-w-2xl px-4 py-10 sm:px-8">
                <h1 className="text-2xl font-bold">Editar subcomunidad</h1>
                <p className="mt-1 text-sm text-gray-400">
                    Estás editando {subcommunity.name}, dentro de {parent.name}.
                </p>

                <EditSubcommunityForm
                    communityId={subcommunity.id}
                    parentSlug={slug}
                    initialName={subcommunity.name}
                    initialDescription={subcommunity.description}
                    initialIconUrl={subcommunity.icon_url}
                    initialBannerUrl={subcommunity.banner_url}
                />
            </div>
        </main>
    );
}