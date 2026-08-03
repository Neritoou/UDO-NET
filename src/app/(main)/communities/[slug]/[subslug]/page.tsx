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
                                    
                    <div className="relative px-5">
                        <div className="absolute -top-7 flex items-center gap-3">
                        {subcommunity.icon_url 
                        ?
                            <Image
                            src={subcommunity.icon_url}
                            alt={subcommunity.name}
                            width={80}
                            height={80}
                            className="object-cover rounded-full border-4 object-cover border-pure-white"
                            />
                        :
                        <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 text-lg font-bold text-white sm:h-16 sm:w-16 sm:text-xl border-pure-white bg-main-blue">
                            {subcommunity.name.charAt(0).toUpperCase()}
                        </div>
                        }
                        </div>
                    </div>
                </div>


            <section className="mt-12 sm:mt-14 px-1 sm:px-2 min-w-0 max-w-full">
                <span className="font-candal font-normal text-extra-small text-alpha-black">
                    Subcomunidad de {parent.name}
                </span>

                <div className="flex flex-col gap-2">
                    <h1 className="font-candal font-normal text-h4 sm:text-h3 text-main-black break-words leading-tight tracking-tight">
                    {subcommunity.name}
                    </h1>
                    
                    <p className="font-candal font-normal text-tiny text-gray-custom break-words w-full leading-relaxed">
                    {subcommunity.description}
                    </p>
                </div>

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
                <div className="max-h-[710px] bg-pure-white rounded-[24px] p-4 space-y-3 overflow-y-auto">
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