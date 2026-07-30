import { getAllCommunities, getSubcommunities, getCommunityBySlug } from "@module_2/communities/services/community.service";
import { InstrustiveAlert } from "@module_2/communities/components/alert";
import { Community } from "@/lib/types";
import { CardCommunities } from "@/modules/module_2/communities/components/card-communities";
import AddSubCommunity from "@module_2/communities/components/button-add";
import MobilePanelToggle from "@module_2/communities/components/mobile-panel-toggle";

export async function GetCommunitiesSC(){
    const communities:Community[] = await getAllCommunities();

    return(
        <>
            {communities.length == 0 ? (
                <InstrustiveAlert msg="No se pudo encontrar ninguna comunidad" />
            ) : (
                <>
                    {communities.map((community) => (
                        <CardCommunities key={community.id} item={community} basePath="/communities" />
                    ))}
                </>
            )}
        </>
    );
};

export async function GetSubcommunitiesSC({ slugCommunity }: { slugCommunity:string }){
    const parentCommunity:Community | null = await getCommunityBySlug(slugCommunity);
    const subCommunities:Community[] = parentCommunity ? await getSubcommunities(parentCommunity.id) : [];

    return(
        <MobilePanelToggle title="Subcomunidades">
            <div className="space-y-3">
                {subCommunities.length == 0 ? (
                    <InstrustiveAlert msg="No se ha encontrado ninguna subcomunidad" />
                ) : (
                    <>
                        {subCommunities.map((subCommunity) => (
                            <CardCommunities
                                key={subCommunity.id}
                                item={subCommunity}
                                basePath={`/communities/${slugCommunity}`}
                            />
                        ))}
                    </>
                )}

                {parentCommunity && (
                    <AddSubCommunity
                        parentId={parentCommunity.id}
                        parentSlug={parentCommunity.slug}
                        parentName={parentCommunity.name}
                    />
                )}
            </div>
        </MobilePanelToggle>
    );
};