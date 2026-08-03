import { notFound } from "next/navigation";
import {
    getCommunityBySlug,
    getSubcommunityBySlug,
    getSubcommunities,
    getCommunityMemberCount,
    isUserSubscribed,
    getCommunityMembers,
} from "@module_2/communities/services/community.service";
import { CardCommunities } from "@module_2/communities/components/card-communities";
import { InstrustiveAlert } from "@module_2/communities/components/alert";
import JoinCommunityComponent from "@module_2/communities/components/button-join";
import LeaveCommunityComponent from "@module_2/communities/components/button-leave";
import MobilePanelToggle from "@module_2/communities/components/mobile-panel-toggle";
import EditSubcommunity from "@/modules/module_2/communities/components/button-edit";
import DeleteSubcommunity from "@/modules/module_2/communities/components/button-delete";

import { getCommunityFeedAction } from "@/modules/module_2/feed/actions/feed.actions";
import CommunityFeed from "@/modules/module_2/feed/components/community-feed";
import CreatePostButton from "@/modules/module_2/feed/components/create-post-button";

import { getCurrentUserId } from "@module_1/auth/exports";

import { getUserRole } from "@module_1/profiles/exports";

import Image from "next/image";
import ShowMembers from "@/modules/module_2/communities/components/button-see-members";

interface PageProps {
    params: Promise<{ slug: string; subslug: string }>;
}

export default async function SubcommunityPage({ params }: PageProps) {
    const { slug, subslug } = await params;

    const parent = await getCommunityBySlug(slug);
    if (!parent) notFound();

    const subcommunity = await getSubcommunityBySlug(subslug, parent.id);
    if (!subcommunity) notFound();
    
    const currentUserId = await getCurrentUserId();

    const [memberCount, subscribed, siblings, posts, userRole, currentUsers] = await Promise.all([
        getCommunityMemberCount(subcommunity.id),
        currentUserId ? isUserSubscribed(currentUserId, subcommunity.id) : Promise.resolve(false),
        getSubcommunities(parent.id),
        getCommunityFeedAction(subcommunity.id),
        currentUserId ? getUserRole(currentUserId) : Promise.resolve(null),
        getCommunityMembers(subcommunity.id),
    ]);

    const relatedSubcommunities = siblings.filter((s) => s.id !== subcommunity.id);
    const canManage =
        currentUserId !== null &&
        (subcommunity.created_by === currentUserId || userRole === "moderator" || userRole === "admin");

    return (
        <main className="min-h-screen bg-gray-blue">
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
            <span className="font-candal font-normal text-extra-small text-alpha-black">
                Subcomunidad de {parent.name}
            </span>
            <h1 className="font-candal font-normal text-h4 sm:text-h3 text-main-black">
                {subcommunity.name}
            </h1>
            <p className="mt-1 font-candal font-normal text-tiny text-gray-custom">
                {subcommunity.description}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-3">
                {subscribed ? (
                <LeaveCommunityComponent communityId={subcommunity.id} />
                ) : (
                <JoinCommunityComponent communityId={subcommunity.id} />
                )}

                <CreatePostButton communityId={subcommunity.id} disabled={!subscribed} />

                {canManage && (
                <>
                    <EditSubcommunity community={parent} subcommunity={subcommunity} />
                    <DeleteSubcommunity community={parent} subcommunity={subcommunity} />
                </>
                )}

                <ShowMembers memberCount={memberCount} currentUsers={currentUsers} communityName={subcommunity.name} />
            </div>
            </section>

            <div className="mt-8 grid grid-cols-12 gap-8">

            <section className="col-span-12 lg:col-span-8">
                <CommunityFeed posts={posts} currentUserId={currentUserId} />
            </section>

            <aside className="lg:col-span-4">
                <MobilePanelToggle title="Relacionado">
                <div className="bg-pure-white rounded-[24px] p-4 space-y-3">
                    <h2 className="font-candal font-normal text-tiny text-main-black px-1">
                    Subcomunidades relacionadas
                    </h2>

                    {relatedSubcommunities.length === 0 ? (
                    <InstrustiveAlert msg="No hay otras subcomunidades relacionadas" />
                    ) : (
                    relatedSubcommunities.map((related) => (
                        <CardCommunities key={related.id} item={related} basePath={`/communities/${slug}`} />
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