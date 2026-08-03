import { Community } from "@/lib/types";
import { formatDate } from "@/lib/utils/formatDate";
import Link from "next/link";
import Image from "next/image";
import { gradients } from "@/lib/constants/communities";


export function CardCommunities({ item, basePath = "/communities" }: { item: Community; basePath?: string }){
    const gradientIndex:number = item.name.length % gradients.length;
    const selectedGradient:string = gradients[gradientIndex];

    return(
        <Link 
            href={`${basePath}/${item.slug}`}
            className="group relative flex w-full flex-col overflow-hidden transition-all duration-200 hover:-translate-y-3"
            >
            <div className="relative w-full overflow-hidden rounded-2xl bg-pure-white border border-white-gray shadow-sm mt-3">
                {item.banner_url != null 
                ? 
                    <div className="relative h-20 w-full bg-lite-white">
                        <Image
                            src={item.banner_url}
                            alt="Communitys Banner"
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover" />
                    </div>
                :
                    <div className={`relative h-20 w-full overflow-hidden bg-gradient-to-r ${selectedGradient} p-4`}>
                        <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
                            
                        <div className="relative z-10 flex items-center gap-2">
                            <span className="rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
                                {item.parent_id == null ? "Comunidad" : "Subcomunidad"}
                            </span>
                        </div>
                    </div>
                }

                <div className="relative px-5">
                    <div className="absolute -top-6 flex items-center gap-3">
                        {item.icon_url != null 
                        ? 
                            <Image
                                src={item.icon_url}
                                alt="Users Photo"
                                width={64}
                                height={64}
                                className="h-16 w-16 rounded-full border-4 object-cover border-pure-white" />
                        :
                            <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 text-lg font-bold text-white sm:h-16 sm:w-16 sm:text-xl border-pure-white bg-main-blue">
                                {item.name.charAt(0).toUpperCase()}
                            </div>
                        }
                        {item.parent_id != null && (
                            <div className="flex flex-col text-xs pt-6">
                                <span className="font-semibold text-main-black">
                                    Creado por un miembro
                                </span>
                                <span className="text-gray-custom">
                                    {formatDate(item.created_at)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-5 pt-10 mt-3">
                    <h3 className="text-xl font-bold text-main-black">
                        {item.name}
                    </h3>
                    <p className="mt-2 text-sm line-clamp-3 text-gray-custom">
                        {item.description}
                    </p>
                </div>

            </div>
        </Link>
    );
}