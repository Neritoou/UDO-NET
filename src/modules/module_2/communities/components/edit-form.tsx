'use client'

import { ChangeEvent, MouseEvent, SubmitEvent, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
    updateSubcommunityAction,
    uploadCommunityIconAction,
    uploadCommunityBannerAction,
} from "@module_2/communities/actions/community.actions";
import { ErrAlert } from "@module_2/communities/components/alert";
import Loader from "@module_2/communities/components/loader";

import { resizeImage, validateImage } from "@/lib/storage/transform";
import { IMAGE_PRESETS } from "@/lib/storage/presets";

interface IEDITFORM {
    communityId: string;
    parentSlug: string;
    initialName: string;
    initialDescription: string;
    initialIconUrl: string | null;
    initialBannerUrl: string | null;
}

type photoAction = 
  | { type: 'select'; event: ChangeEvent<HTMLInputElement> }
  | { type: 'remove'; event?: MouseEvent<HTMLButtonElement> };

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
};

export default function EditSubcommunityForm({
    communityId,
    parentSlug,
    initialName,
    initialDescription,
    initialIconUrl,
    initialBannerUrl,
}: IEDITFORM) {
    const [name, setName] = useState<string>(initialName);
    const [description, setDescription] = useState<string>(initialDescription);

    const [iconFile, setIconFile] = useState<File | undefined>(undefined);
    const [iconPreview, setIconPreview] = useState<string | null>(initialIconUrl);
    const [bannerFile, setBannerFile] = useState<File | undefined>(undefined);
    const [bannerPreview, setBannerPreview] = useState<string | null>(initialBannerUrl);

    const iconInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    const [errorMsg, setErrorMsg] = useState<string>("");
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleIconChange = async (action: photoAction) => {
        if (action.type === 'remove') {
            action.event?.stopPropagation();

            if (iconPreview) {
                URL.revokeObjectURL(iconPreview);
            }

            setIconFile(undefined);
            setIconPreview(null);
            setErrorMsg("");

            if (iconInputRef.current) {
                iconInputRef.current.value = "";
            }
            return;
        }

        const rawFile = action.event.target.files?.[0];

        if (!rawFile) {
            setErrorMsg("");
            return;
        }

        const config = {
            maxSize: IMAGE_PRESETS.communityIcon.maxSize,
            allowedTypes: IMAGE_PRESETS.communityIcon.allowedTypes,
        };

        const errorType = await validateImage(rawFile, config);

        if (errorType) {
            setErrorMsg(errorType);
            return;
        }

        try {
            const resizedBlob = await resizeImage(rawFile, IMAGE_PRESETS.communityIcon.dimensions);

            const resizedFile = new File([resizedBlob], rawFile.name.replace(/\.[^/.]+$/, ".webp"), {
                type: 'image/webp',
                lastModified: Date.now(),
            });

            if (iconPreview) {
                URL.revokeObjectURL(iconPreview);
            }

            setIconFile(resizedFile);
            setIconPreview(URL.createObjectURL(resizedFile));
            setErrorMsg("");

        } catch (error) {
            const message = error instanceof Error ? error.message : 'Error al procesar la imagen.';
            setErrorMsg(message);
        }

    };

    const handleBannerChange = async (action: photoAction) => {
        if (action.type === 'remove') {
            action.event?.stopPropagation();

            if (bannerPreview) {
                URL.revokeObjectURL(bannerPreview);
            }

            setBannerFile(undefined);
            setBannerPreview(null);
            setErrorMsg("");

            if (bannerInputRef.current) {
                bannerInputRef.current.value = "";
            }
            return;
        }

        const rawFile = action.event.target.files?.[0];

        if (!rawFile) {
            setErrorMsg("");
            return;
        }

        const config = {
            maxSize: IMAGE_PRESETS.communityBanner.maxSize,
            allowedTypes: IMAGE_PRESETS.communityBanner.allowedTypes,
        };

        const errorType = await validateImage(rawFile, config);

        if (errorType) {
            setErrorMsg(errorType);
            return;
        }

        try {
            const resizedBlob = await resizeImage(rawFile, IMAGE_PRESETS.communityBanner.dimensions);

            const resizedFile = new File([resizedBlob], rawFile.name.replace(/\.[^/.]+$/, ".webp"), {
                type: 'image/webp',
                lastModified: Date.now(),
            });

            if (bannerPreview) {
                URL.revokeObjectURL(bannerPreview);
            }

            setBannerFile(resizedFile);
            setBannerPreview(URL.createObjectURL(resizedFile));
            setErrorMsg("");
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Error al procesar la imagen.';
            setErrorMsg(message);
        }
    };

    const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMsg("");

        startTransition(async () => {
            try {
                const result = await updateSubcommunityAction(communityId, name, description);

                if (result.error) {
                    setErrorMsg(result.error || "Error al actualizar la subcomunidad.");
                    return;
                }

                if (iconFile) {
                    try {
                        const base64Icon = await fileToBase64(iconFile);
                        const iconResult = await uploadCommunityIconAction(communityId, base64Icon);

                        if (iconResult.error) {
                            setErrorMsg(`Se actualizó la información, pero hubo un error al cargar el icono: ${iconResult.error}`);
                            return;
                        }
                    } catch (err) {
                        setErrorMsg("Error al procesar el archivo del icono.");
                        return;
                    }
                }

                if (bannerFile) {
                    try {
                        const base64Banner = await fileToBase64(bannerFile);
                        const bannerResult = await uploadCommunityBannerAction(communityId, base64Banner);

                        if (bannerResult.error) {
                            setErrorMsg(`Se actualizó la información, pero hubo un error al cargar el banner: ${bannerResult.error}`);
                            return;
                        }
                    } catch (err) {
                        setErrorMsg("Error al procesar el archivo del banner.");
                        return;
                    }
                }

                router.push(`/communities/${parentSlug}/${result.data!.slug}`);
            } catch (e: unknown) {
                if (e instanceof Error) {
                    setErrorMsg(e.message);
                } else {
                    setErrorMsg("Ocurrió un error inesperado al conectar con el servidor.");
                }
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">

            <div className="space-y-1">
                <label className={`${isPending ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-60' : 'bg-gray-200 border-gray-300 cursor-pointer hover:bg-gray-300'} 
                    relative flex flex-col items-center justify-center h-28 w-full bg-gray-200 hover:bg-gray-250 rounded-2xl transition-all border-2 border-dashed border-transparent hover:border-gray-500 overflow-hidden group`}>
                                               
                    {bannerPreview ? (
                        <div className="relative w-full h-full">
                            <Image src={bannerPreview} alt="Banner preview" className="w-full h-full object-cover rounded-2xl" fill unoptimized />
                                                   
                            <button
                                type="button"
                                disabled={isPending}
                                onClick={(e) => handleBannerChange({ type: 'remove', event: e })}
                                className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-75"
                                title="Remove banner"
                                >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        ) : (
                        <span className="text-gray-500 font-semibold flex items-center gap-2 text-sm">
                            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            Subir Banner
                        </span>
                    )}
                    <input 
                        ref={bannerInputRef}
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        onChange={(e) => handleBannerChange({ type: 'select', event: e })}
                    />
                </label>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <label
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 border-dashed border-transparent hover:border-gray-500 shadow-sm transition-all overflow-hidden relative ${
                                isPending
                                ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-60'
                                : 'bg-gray-200 border-gray-300 cursor-pointer hover:bg-gray-300'
                            }`}>
                            {iconPreview ? (
                                <Image src={iconPreview} alt="Profile preview" className="w-full h-full object-cover" fill unoptimized />
                            ) : (
                                <svg className="w-7 h-7 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                    d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                                    />
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                    d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
                                    />
                                </svg>
                            )}
                
                            <input
                                ref={iconInputRef}
                                type="file"
                                disabled={isPending}
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => handleIconChange({ type: 'select', event: e})}
                            />
                        </label>
                
                        {iconPreview && 
                            <button
                                type="button"
                                disabled={isPending}
                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 transition"
                                title="Eliminar foto"
                                onClick={(e) => handleIconChange({ type:'remove', event: e })}
                            >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        }
                    </div>
                
                    <span className={`text-sm font-semibold ${isPending ? 'text-gray-400' : 'text-gray-500'}`}>
                        {iconPreview ? 'Cambiar foto de perfil' : 'Subir foto de perfil'}
                    </span>
                </div>
            </div>

            <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-200">
                    Nombre de la Subcomunidad
                </label>
                <input
                    type="text"
                    value={name}
                    disabled={isPending}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                    className="w-full rounded-md border border-gray-800 bg-gray-900 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
                <p className="text-right text-xs text-slate-500">
                    {name.length}/50
                </p>
            </div>

            <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-200">
                    Descripción de la Subcomunidad
                </label>
                <textarea
                    rows={4}
                    value={description}
                    disabled={isPending}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                    className="w-full resize-none rounded-md border border-gray-800 bg-gray-900 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
            </div>

            {errorMsg && <ErrAlert msg={errorMsg} />}

            <div className="flex items-center gap-3">
                <button
                    type="submit"
                    disabled={isPending}
                    className="rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    Guardar cambios
                </button>
                {isPending && <Loader />}
            </div>
        </form>
    );
}