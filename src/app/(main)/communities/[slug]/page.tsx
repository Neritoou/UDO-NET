import { notFound } from "next/navigation";

import {
    getCommunityBySlug,
    getCommunityMemberCount,
    getCommunityMembers,
    isUserSubscribed,
} from "@module_2/communities/services/community.service";

import { GetSubcommunitiesSC } from "@module_2/communities/components/get-communities-svr";
import JoinCommunityComponent from "@module_2/communities/components/button-join";
import LeaveCommunityComponent from "@module_2/communities/components/button-leave";

import { getCommunityFeedAction } from "@/modules/module_2/feed/actions/feed.actions";
import CommunityFeed from "@/modules/module_2/feed/components/community-feed";
import CreatePostButton from "@/modules/module_2/feed/components/create-post-button";
import EditSubcommunity from "@/modules/module_2/communities/components/button-edit";

import { getCurrentUserId } from "@module_1/auth/exports";
import Image from "next/image";
import ShowMembers from "@/modules/module_2/communities/components/button-see-members";
import { getUserRole } from "@/modules/module_1/profiles/exports";
import { gradients } from "@/lib/constants/communities";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function CommunityPage({ params }: PageProps) {
    
    const { slug } = await params;
    
    const community = await getCommunityBySlug(slug);
    if (!community) notFound();
    
    const gradientIndex:number = community.name.length % gradients.length;
    const selectedGradient:string = gradients[gradientIndex];

    const currentUserId = await getCurrentUserId();

    const [memberCount, subscribed, posts, currentUsers, userRole] = await Promise.all([
        getCommunityMemberCount(community.id),
        currentUserId ? isUserSubscribed(currentUserId, community.id) : Promise.resolve(false),
        getCommunityFeedAction(community.id),
        getCommunityMembers(community.id),
        currentUserId ? getUserRole(currentUserId) : Promise.resolve(null)
    ]);

    const canManage:boolean = currentUserId !== null && userRole === "admin";

    return (
        <main className="min-h-screen bg-gray-blue">
        <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-8">

                <div className="relative h-40 sm:h-52 -mx-4 sm:mx-0">
                    <div className={`relative h-full w-full rounded-b-xl sm:rounded-xl overflow-hidden bg-gradient-to-r ${selectedGradient}`}>
                        {community.banner_url && (
                        <Image
                            src={community.banner_url}
                            alt={`${community.name} banner`}
                            fill
                            priority
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, (max-width: 1200px) 100vw, 1200px"
                        />
                        )}
                    </div>
                    
                    <div className="relative px-5">
                        <div className="absolute -top-7 flex items-center gap-3">
                        {community.icon_url 
                        ?
                            <Image
                            src={community.icon_url}
                            alt={community.name}
                            width={80}
                            height={80}
                            className="object-cover rounded-full border-4 object-cover border-pure-white"
                            />
                        :
                        <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 text-lg font-bold text-white sm:h-16 sm:w-16 sm:text-xl border-pure-white bg-main-blue">
                            {community.name.charAt(0).toUpperCase()}
                        </div>
                        }

                        </div>
                    </div>



                </div>

            <section className="mt-12 sm:mt-14 px-1 sm:px-2 min-w-0 max-w-full">
            
                <div className="flex flex-col gap-2">
                    <h1 className="font-candal font-normal text-h4 sm:text-h3 text-main-black break-words leading-tight tracking-tight">
                        {community.name}
                    </h1>
                    
                    <p className="font-candal font-normal text-tiny text-gray-custom break-words w-full leading-relaxed">
                        {community.description}
                    </p>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                    {subscribed ? (
                        <LeaveCommunityComponent communityId={community.id} />
                    ) : (
                        <JoinCommunityComponent communityId={community.id} />
                    )}

                    <CreatePostButton communityId={community.id} disabled={!subscribed} />

                    
                    {canManage && (
                        <EditSubcommunity community={community} />
                    )}

                    <ShowMembers memberCount={memberCount} currentUsers={currentUsers} communityName={community.name} />
                </div>
            </section>

            <div className="mt-8 grid grid-cols-12 lg:gap-8 gap-4">

            <section className="col-span-12 lg:col-span-8">
                <CommunityFeed posts={posts} currentUserId={currentUserId} />
            </section>

            <aside className="lg:col-span-4">
                <GetSubcommunitiesSC
                parentId={community.id}
                parentSlug={slug}
                parentName={community.name}
                />
            </aside>

            </div>

        </div>
        </main>
    );
}