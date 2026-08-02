import { notFound } from "next/navigation";
import {
    getCommunityBySlug,
    getSubcommunityBySlug,
    getSubcommunities,
    getCommunityMemberCount,
    isUserSubscribed,
} from "@module_2/communities/services/community.service";
import { CardCommunities } from "@module_2/communities/components/card-communities";
import { InstrustiveAlert } from "@module_2/communities/components/alert";
import JoinCommunityComponent from "@module_2/communities/components/button-join";
import LeaveCommunityComponent from "@module_2/communities/components/button-leave";
import MobilePanelToggle from "@module_2/communities/components/mobile-panel-toggle";
import Image from "next/image";
import EditSubcommunity from "@/modules/module_2/communities/components/button-edit";
import DeleteSubcommunity from "@/modules/module_2/communities/components/button-delete";

const MOCK_USER_ID = "00000000-0000-0000-0000-000000000001";

interface PageProps {
    params: Promise<{
        slug: string;
        subslug: string;
    }>;
}

export default async function SubcommunityPage({ params }: PageProps) {
    const { slug, subslug } = await params;

    const parent = await getCommunityBySlug(slug);
    if (!parent) notFound();

    const subcommunity = await getSubcommunityBySlug(subslug, parent.id);
    if (!subcommunity) notFound();

    const [memberCount, subscribed, siblings] = await Promise.all([
        getCommunityMemberCount(subcommunity.id),
        isUserSubscribed(MOCK_USER_ID, subcommunity.id),
        getSubcommunities(parent.id),
    ]);

    const relatedSubcommunities = siblings.filter((s) => s.id !== subcommunity.id);
    const canManage = subcommunity.created_by === MOCK_USER_ID;

    return (
        <main className="min-h-screen bg-gray-950 text-white">
            <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-8">

                <div className="relative h-40 sm:h-52 -mx-4 sm:mx-0">
                    <div className="relative h-full w-full rounded-b-xl sm:rounded-xl overflow-hidden bg-gradient-to-r from-cyan-950 via-blue-950 to-indigo-950">
                        {subcommunity.banner_url && (
                            <Image
                                src={subcommunity.banner_url}
                                alt={`${subcommunity.name} banner`}
                                fill
                                priority
                                className="object-cover"
                                sizes="(max-width: 640px) 100vw, (max-width: 1200px) 100vw, 1200px"
                            />
                        )}
                        </div>
                                    
                        <div className="absolute -bottom-10 left-4 sm:left-6 h-20 w-20 sm:h-24 sm:w-24 rounded-full border-4 border-gray-950 bg-gray-800 overflow-hidden">
                            <Image
                                src={subcommunity.icon_url ?? "/defaults/community_icon.svg"}
                                alt={subcommunity.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 80px, 96px"
                            />
                        </div>
                    </div>

                <section className="mt-12 sm:mt-14 px-1 sm:px-2">
                    <span className="text-xs text-gray-400">
                        Subcomunidad de {parent.name}
                    </span>
                    <h1 className="text-xl sm:text-2xl font-bold">
                        {subcommunity.name}
                    </h1>
                    <p className="mt-1 text-sm text-gray-300">
                        {subcommunity.description}
                    </p>

                    <div className="mt-3 flex items-center gap-3">
                        {subscribed ? (
                            <LeaveCommunityComponent communityId={subcommunity.id} />
                        ) : (
                            <JoinCommunityComponent communityId={subcommunity.id} />
                        )}

                        {canManage && (
                            <>
                                <EditSubcommunity community={parent} subcommunity={subcommunity} />
                                <DeleteSubcommunity community={parent} subcommunity={subcommunity} />
                            </>
                        )}

                        <span className="text-xs text-gray-500">
                            {memberCount} {memberCount === 1 ? "miembro" : "miembros"}
                        </span>
                    </div>
                </section>

                <div className="mt-8 grid grid-cols-12 gap-8">

                    <section className="col-span-12 lg:col-span-8">
                        <div className="rounded-xl border border-dashed border-gray-800 p-8 text-center text-sm text-gray-500">
                            Todavía no hay publicaciones en esta subcomunidad.
                        </div>
                    </section>

                    <aside className="lg:col-span-4">
                        <MobilePanelToggle title="Relacionadas">
                            <div className="space-y-3">
                                <h2 className="text-sm font-semibold text-gray-200 px-1">
                                    Subcomunidades relacionadas
                                </h2>
                                {relatedSubcommunities.length === 0 ? (
                                    <InstrustiveAlert msg="No hay otras subcomunidades relacionadas" />
                                ) : (
                                    relatedSubcommunities.map((related) => (
                                        <CardCommunities
                                            key={related.id}
                                            item={related}
                                            basePath={`/communities/${slug}`}
                                        />
                                    ))
                                )}
                            </div>
                        </MobilePanelToggle>
                    </aside>

                </div>

            </div>
        </main>
    );
}