import { notFound } from "next/navigation";

import {
    getCommunityBySlug,
} from "@module_2/communities/services/community.service";

import { GetSubcommunitiesSC } from "@module_2/communities/components/get-communities-svr";

interface PageProps {
    params: {
        slug: string;
    };
}

export default async function CommunityPage({
    params,
}: PageProps) {

    const community = await getCommunityBySlug(params.slug);

    if (!community) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-gray-950 text-white">
            <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-8">

                {/* Banner */}
                <div
                    className="h-40 sm:h-52 rounded-b-xl sm:rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 -mx-4 sm:mx-0"
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

                {/* Header */}
                <section className="relative mt-[-3rem] flex flex-col gap-4 px-1 sm:flex-row sm:items-end sm:gap-5">

                    <img
                        src={community.icon_url ?? "/defaults/community_icon.svg"}
                        className="h-24 w-24 sm:h-28 sm:w-28 rounded-full border-4 border-gray-950 bg-gray-800 object-cover"
                        alt={community.name}
                    />

                    <div className="pb-1">
                        <h1 className="text-2xl sm:text-4xl font-bold">
                            {community.name}
                        </h1>

                        <p className="mt-1 text-sm text-gray-300">
                            {community.description}
                        </p>
                    </div>

                </section>

                <div className="mt-8 grid grid-cols-12 gap-8">

                    <section className="col-span-12 lg:col-span-8">
                        {/* AQUÍ VA EL FEED (module_3/posts) */}
                        <div className="rounded-xl border border-dashed border-gray-800 p-8 text-center text-sm text-gray-500">
                            Todavía no hay publicaciones en esta comunidad.
                        </div>
                    </section>

                    <aside className="hidden lg:block lg:col-span-4">
                        <GetSubcommunitiesSC
                            slugCommunity={params.slug}
                        />
                    </aside>

                </div>

            </div>
        </main>
    );
}