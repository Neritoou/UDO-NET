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

import { getCurrentUserId } from "@module_1/auth/exports";
import Image from "next/image";
import ShowMembers from "@/modules/module_2/communities/components/button-see-members";

import type { User } from '@/lib/types'

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function CommunityPage({ params }: PageProps) {
    const { slug } = await params;

    const community = await getCommunityBySlug(slug);
    if (!community) notFound();

    const currentUserId = await getCurrentUserId();

    const [memberCount, subscribed, posts, currentUsers] = await Promise.all([
        getCommunityMemberCount(community.id),
        currentUserId ? isUserSubscribed(currentUserId, community.id) : Promise.resolve(false),
        getCommunityFeedAction(community.id),
        getCommunityMembers(community.id),
    ]);

    return (
        <main className="min-h-screen bg-gray-blue">
        <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-8">

                <div className="relative h-40 sm:h-52 -mx-4 sm:mx-0">
                    <div className="relative h-full w-full rounded-b-xl sm:rounded-xl overflow-hidden bg-gradient-to-r from-cyan-950 via-blue-950 to-indigo-950">
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
                    
                    <div className="absolute -bottom-10 left-4 sm:left-6 h-20 w-20 sm:h-24 sm:w-24 rounded-full border-4 border-gray-950 bg-gray-800 overflow-hidden">
                        <Image
                        src={community.icon_url ?? "/defaults/community_icon.svg"}
                        alt={community.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 80px, 96px"
                        />
                    </div>
                </div>

            <section className="mt-12 sm:mt-14 px-1 sm:px-2">
            <h1 className="font-candal font-normal text-h4 sm:text-h3 text-main-black">
                {community.name}
            </h1>
            <p className="mt-1 font-candal font-normal text-tiny text-gray-custom">
                {community.description}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-3">
                {subscribed ? (
                    <LeaveCommunityComponent communityId={community.id} />
                ) : (
                    <JoinCommunityComponent communityId={community.id} />
                )}

                <CreatePostButton communityId={community.id} disabled={!subscribed} />

                <ShowMembers memberCount={memberCount} currentUsers={currentUsers} communityName={community.name} />
            </div>
            </section>

            <div className="mt-8 grid grid-cols-12 gap-8">

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