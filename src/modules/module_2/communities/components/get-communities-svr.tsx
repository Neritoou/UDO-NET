import { getAllCommunities, getSubcommunities, isUserSubscribed } from "@module_2/communities/services/community.service";
import { InstrustiveAlert } from "@module_2/communities/components/alert";
import { Community } from "@/lib/types";
import { CardCommunities } from "@/modules/module_2/communities/components/card-communities";
import AddSubCommunity from "@module_2/communities/components/button-add";
import MobilePanelToggle from "@module_2/communities/components/mobile-panel-toggle";
import { getCurrentUserId } from "@module_1/auth/exports";

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
    const currentUserId = await getCurrentUserId();

    const [subCommunities, canCreateSubcommunity] = await Promise.all([
        getSubcommunities(parentId),
        currentUserId ? isUserSubscribed(currentUserId, parentId) : Promise.resolve(false),
    ]);

    return(
        <MobilePanelToggle title="Subcomunidades">
            <div className="bg-pure-white max-h-[710px] rounded-[24px] p-4 space-y-3 overflow-y-auto">
                <h2 className="font-candal font-normal text-tiny text-main-black px-1">
                    Subcomunidades
                </h2>

                {canCreateSubcommunity && (
                    <AddSubCommunity
                        parentId={parentId}
                        parentSlug={parentSlug}
                        parentName={parentName}
                    />
                )}

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
            </div>
        </MobilePanelToggle>
    );
};