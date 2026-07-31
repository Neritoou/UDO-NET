import { notFound } from "next/navigation";

import {
    getCommunityBySlug,
    getCommunityMemberCount,
    isUserSubscribed,
} from "@module_2/communities/services/community.service";

import { GetSubcommunitiesSC } from "@module_2/communities/components/get-communities-svr";
import JoinCommunityComponent from "@module_2/communities/components/button-join";
import LeaveCommunityComponent from "@module_2/communities/components/button-leave";

const MOCK_USER_ID = "00000000-0000-0000-0000-000000000001";

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default async function CommunityPage({
    params,
}: PageProps) {

    const { slug } = await params;

    const community = await getCommunityBySlug(slug);

    if (!community) {
        notFound();
    }

    const [memberCount, subscribed] = await Promise.all([
        getCommunityMemberCount(community.id),
        isUserSubscribed(MOCK_USER_ID, community.id),
    ]);

    return (
        <main className="min-h-screen bg-gray-950 text-white">
            <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-8">

                <div className="relative h-40 sm:h-52 -mx-4 sm:mx-0">
                    <div
                        className="h-full w-full rounded-b-xl sm:rounded-xl bg-gradient-to-r from-cyan-950 via-blue-950 to-indigo-950"
                        style={
                            community.banner_url
                                ? {
                                    backgroundImage: `url(${community.banner_url})`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                }
                                : undefined
                        }
                    />
                    <img
                        src={community.icon_url ?? "/defaults/community_icon.svg"}
                        className="absolute -bottom-10 left-4 sm:left-6 h-20 w-20 sm:h-24 sm:w-24 rounded-full border-4 border-gray-950 bg-gray-800 object-cover"
                        alt={community.name}
                    />
                </div>

                <section className="mt-12 sm:mt-14 px-1 sm:px-2">
                    <h1 className="text-xl sm:text-2xl font-bold">
                        {community.name}
                    </h1>

                    <p className="mt-1 text-sm text-gray-300">
                        {community.description}
                    </p>

                    <div className="mt-3 flex items-center gap-3">
                        {subscribed ? (
                            <LeaveCommunityComponent communityId={community.id} />
                        ) : (
                            <JoinCommunityComponent communityId={community.id} />
                        )}

                        <span className="text-xs text-gray-500">
                            {memberCount} {memberCount === 1 ? "miembro" : "miembros"}
                        </span>
                    </div>
                </section>

                <div className="mt-8 grid grid-cols-12 gap-8">

                    <section className="col-span-12 lg:col-span-8">
                        <div className="rounded-xl border border-dashed border-gray-800 p-8 text-center text-sm text-gray-500">
                            Todavía no hay publicaciones en esta comunidad.
                        </div>
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