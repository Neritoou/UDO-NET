import { notFound } from "next/navigation";

import {

    getCommunityBySlug,

    getSubcommunityBySlug,

} from "@module_2/communities/services/community.service";

interface PageProps {

    params: {

        slug: string;

        subslug: string;

    };

}

export default async function SubcommunityPage({

    params,

}: PageProps) {

    const parent = await getCommunityBySlug(params.slug);

    if (!parent) {

        notFound();

    }

    const subcommunity = await getSubcommunityBySlug(

        params.subslug,

        parent.id,

    );

    if (!subcommunity) {

        notFound();

    }

    return (

        <main className="mx-auto max-w-7xl">

            <div
                className="h-52 rounded-xl bg-neutral-800"
                style={{
                    backgroundImage: subcommunity.banner_url
                        ? `url(${subcommunity.banner_url})`
                        : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            />

            <section className="mt-5 flex gap-5">

                <img
                    src={subcommunity.icon_url ?? "/default-community.png"}
                    className="h-28 w-28 rounded-full border-4"
                    alt={subcommunity.name}
                />

                <div>

                    <h1 className="text-4xl font-bold">

                        {subcommunity.name}

                    </h1>

                    <p>

                        {subcommunity.description}

                    </p>

                    <span className="text-sm text-neutral-400">

                        Comunidad padre: {parent.name}

                    </span>

                </div>

            </section>

            <div className="mt-8">

                {/* AQUÍ VAN LOS POSTS DE ESA SUBCOMUNIDAD */}

            </div>

        </main>

    );

}