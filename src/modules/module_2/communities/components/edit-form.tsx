'use client'

import { ChangeEvent, FormEvent, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
    updateSubcommunityAction,
    uploadCommunityIconAction,
    uploadCommunityBannerAction,
} from "@module_2/communities/actions/community.actions";
import { ErrAlert } from "@module_2/communities/components/alert";
import Loader from "@module_2/communities/components/loader";

interface IEDITFORM {
    communityId: string;
    parentSlug: string;
    initialName: string;
    initialDescription: string;
    initialIconUrl: string | null;
    initialBannerUrl: string | null;
}

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

    const handleIconChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIconFile(file);
        setIconPreview(URL.createObjectURL(file));
    };

    const handleBannerChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setBannerFile(file);
        setBannerPreview(URL.createObjectURL(file));
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMsg("");

        startTransition(async () => {
            const result = await updateSubcommunityAction(communityId, name, description);

            if (result.error) {
                setErrorMsg(result.error);
                return;
            }

            if (iconFile) {
                const base64Icon = await fileToBase64(iconFile);
                const iconResult = await uploadCommunityIconAction(communityId, base64Icon);
                if (iconResult.error) {
                    setErrorMsg(`Se actualizó el nombre/descripción, pero falló el icono: ${iconResult.error}`);
                    return;
                }
            }

            if (bannerFile) {
                const base64Banner = await fileToBase64(bannerFile);
                const bannerResult = await uploadCommunityBannerAction(communityId, base64Banner);
                if (bannerResult.error) {
                    setErrorMsg(`Se actualizó el nombre/descripción, pero falló el banner: ${bannerResult.error}`);
                    return;
                }
            }

            router.push(`/communities/${parentSlug}/${result.data!.slug}`);
        });
    };

    return (
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">

            <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-200">
                    Banner
                </label>
                <div
                    onClick={() => !isPending && bannerInputRef.current?.click()}
                    className="relative h-28 w-full rounded-xl border border-dashed border-gray-700 bg-gray-900 overflow-hidden cursor-pointer hover:border-gray-600 transition"
                >
                    {bannerPreview ? (
                        <img src={bannerPreview} alt="Banner" className="h-full w-full object-cover" />
                    ) : (
                        <div className="flex h-full items-center justify-center text-sm text-gray-500">
                            Subir banner
                        </div>
                    )}
                </div>
                <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    disabled={isPending}
                    className="hidden"
                    onChange={handleBannerChange}
                />
            </div>

            <div className="flex items-center gap-4">
                <div
                    onClick={() => !isPending && iconInputRef.current?.click()}
                    className="h-16 w-16 shrink-0 rounded-full border border-dashed border-gray-700 bg-gray-900 overflow-hidden cursor-pointer hover:border-gray-600 transition"
                >
                    {iconPreview ? (
                        <img src={iconPreview} alt="Icono" className="h-full w-full object-cover" />
                    ) : (
                        <div className="flex h-full items-center justify-center text-[10px] text-gray-500 text-center px-1">
                            Icono
                        </div>
                    )}
                </div>
                <input
                    ref={iconInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    disabled={isPending}
                    className="hidden"
                    onChange={handleIconChange}
                />
                <span className="text-xs text-gray-500">
                    Foto de perfil de la subcomunidad
                </span>
            </div>

            <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-200">
                    Nombre
                </label>
                <input
                    type="text"
                    value={name}
                    disabled={isPending}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                    className="w-full rounded-md border border-gray-800 bg-gray-900 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
            </div>

            <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-200">
                    Descripción
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