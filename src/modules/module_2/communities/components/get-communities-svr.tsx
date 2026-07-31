// src/modules/module_2/communities/components/get-communities-svr.tsx
import { getAllCommunities, getSubcommunities } from "@module_2/communities/services/community.service";
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

interface IGETSUBCOMMUNITIES {
    parentId: string;
    parentSlug: string;
    parentName: string;
}

export async function GetSubcommunitiesSC({ parentId, parentSlug, parentName }: IGETSUBCOMMUNITIES){
    const subCommunities:Community[] = await getSubcommunities(parentId);
    return(
        <MobilePanelToggle title="Subcomunidades">
            <div className="space-y-3">
                {subCommunities.length == 0 ? (
                    <InstrustiveAlert msg="No se ha encontrado ninguna subcomunidad" />
                ) : (
                    subCommunities.map((subCommunity) => (
                        <CardCommunities
                            key={subCommunity.id}
                            item={subCommunity}
                            basePath={`/communities/${parentSlug}`}
                        />
                    ))
                )}
                <AddSubCommunity
                    parentId={parentId}
                    parentSlug={parentSlug}
                    parentName={parentName}
                />
            </div>
        </MobilePanelToggle>
    );
};