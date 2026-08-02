'use client'

import { ChangeEvent, SubmitEvent, useRef, useState, MouseEvent, Dispatch, SetStateAction, useTransition } from "react";
import { useRouter } from 'next/navigation'
import Image from "next/image";
import Loader from "@module_2/communities/components/loader";
import { ErrAlert } from "@module_2/communities/components/alert";
import { generateSlug } from "@/lib/utils/generateSlug";
import { createSubcommunityAction, deleteSubcommunityAction, uploadCommunityBannerAction, uploadCommunityIconAction } from "@module_2/communities/actions/community.actions";
import { resizeImage, validateImage } from "@/lib/storage/transform";
import { IMAGE_PRESETS } from "@/lib/storage/presets";
import { MAX_DESCRIPTION_LENGTH, MAX_NAME_LENGTH, MIN_DESCRIPTION_LENGTH, MIN_NAME_LENGTH } from "@/lib/constants/communities";

interface IDATAFORM{
    url_banner: File | undefined;
    url_user_photo: File | undefined;
    name_community: string;
    description_community: string;
};

interface IERRDATA{
    err_name: string;
    err_description: string;
    err_banner: string;
    err_photo: string;
};

interface IMODALFORM{
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
    parentId: string;
    parentSlug: string;
    parentName: string;
}

const DATA_FORM:IDATAFORM = {
    url_banner: undefined,
    url_user_photo: undefined,
    name_community: "",
    description_community: ""
};

const ERR_DATA_FORM:IERRDATA = {
    err_name: "",
    err_description: "",
    err_banner: "",
    err_photo: ""
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export default function FormCreateSubCommunity({ isOpen, setIsOpen, parentId, parentSlug, parentName }: IMODALFORM){    
    const [formData, setFormData] = useState<IDATAFORM>(DATA_FORM);
    const [msgErr, setMsgErr] = useState<IERRDATA>(ERR_DATA_FORM);
    const [msgErrSrv, setMsgErrSrv] = useState<string>("");

    const [bannerPreview, setBannerPreview] = useState<string | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const fileInputRefBanner = useRef<HTMLInputElement>(null);
    const fileInputRefPhoto = useRef<HTMLInputElement>(null);
    
    const router = useRouter();
    const [isPending, startTransition] = useTransition()

    const handleSubmit = (e:SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMsgErrSrv("");

        startTransition(async () => {
            try{

                const result = await createSubcommunityAction(formData.name_community, formData.description_community, parentId);

                if(formData.name_community.length < MIN_NAME_LENGTH || formData.description_community.length < MIN_DESCRIPTION_LENGTH) return;

                if(result.error){
                    setMsgErrSrv(result.error);
                    return;
                };

                const rollbackCommunity = async (errorMessage: string) => {
                    await deleteSubcommunityAction(result.data!.id);
                    setMsgErrSrv(errorMessage);
                };

                if(formData.url_banner){
                    try {
                        const base64Banner = await fileToBase64(formData.url_banner);
                        const bannerResult = await uploadCommunityBannerAction(result.data!.id, base64Banner);

                        if (bannerResult.error) {
                            await rollbackCommunity(`Error al subir el banner: ${bannerResult.error}`);
                            return; 
                        }
                    } catch {
                        await rollbackCommunity("Error al procesar el archivo del banner.");
                        return;
                    }
                };

                if (formData.url_user_photo) {
                    try {
                        const base64UserPhoto = await fileToBase64(formData.url_user_photo);
                        const avatarRes = await uploadCommunityIconAction(result.data!.id, base64UserPhoto);

                        if (avatarRes.error) {
                            await rollbackCommunity(`Error avatar: ${avatarRes.error}`);
                            return;
                        }
                    } catch {
                        await rollbackCommunity("Error al procesar el archivo del avatar.");
                        return;
                    }
                };

                router.push(`/communities/${parentSlug}/${result.data!.slug}`);
            }catch(e:unknown){
                if (e instanceof Error) {
                    setMsgErrSrv(e.message);
                } else {
                    setMsgErrSrv("Ocurrió un error inesperado al conectar con el servidor.");
                };
            };
        });
    };

    //BLOCK BANNER
    const validBanner = async (file: File | undefined):Promise<File | null> => {
        if(!file){
            setMsgErr((prevState) => ({ ...prevState, err_banner: "" }));
            return null;
        };

        const config = { 
            maxSize: IMAGE_PRESETS.communityBanner.maxSize,
            allowedTypes: IMAGE_PRESETS.communityBanner.allowedTypes
        };
        const errorType = await validateImage(file, config);

        if (errorType) {
            setMsgErr((prevState) => ({ ...prevState, err_banner: errorType }));
            return null;
        };

        try {
            const resizedBlob = await resizeImage(file, IMAGE_PRESETS.communityBanner.dimensions);

            const resizedFile = new File([resizedBlob], file.name.replace(/\.[^/.]+$/, ".webp"), {
                type: 'image/webp',
                lastModified: Date.now(),
            });

            return resizedFile;

        } catch (error) {
            const message = error instanceof Error ? error.message : 'Error al procesar la imagen.';
            setMsgErr((prevState) => ({ ...prevState, err_banner: message }));
            return null;
        };
    };

    const handleBannerChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const rawFile:File | undefined = e.target.files?.[0];

        const processedFile = await validBanner(rawFile);

        if (processedFile) {
            setMsgErr((prev) => ({ ...prev, err_banner: "" }));
            setFormData((prev) => ({ ...prev, url_banner: processedFile }));
            setBannerPreview(URL.createObjectURL(processedFile));
        };
    };

    const handleRemoveBanner = (e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        setFormData((prev) => ({ ...prev, url_banner: undefined }));
        if (bannerPreview) {
            URL.revokeObjectURL(bannerPreview);
        }

        setBannerPreview(null);

        if (fileInputRefBanner.current) {
            fileInputRefBanner.current.value = "";
        }
    };

    //BLOCK PHOTO
    const validPhoto = async (file: File | undefined):Promise<File | null> => {
        if(!file){
            setMsgErr((prevState) => ({ ...prevState, err_photo: "" }));
            return null;
        };

        const config = { 
            maxSize: IMAGE_PRESETS.communityIcon.maxSize,
            allowedTypes: IMAGE_PRESETS.communityIcon.allowedTypes
        };
        const errorType = await validateImage(file, config);

        if (errorType) {
            setMsgErr((prevState) => ({ ...prevState, err_photo: errorType }));
            return null;
        };

        try {
            const resizedBlob = await resizeImage(file, IMAGE_PRESETS.communityIcon.dimensions);

            const resizedFile = new File([resizedBlob], file.name.replace(/\.[^/.]+$/, ".webp"), {
                type: 'image/webp',
                lastModified: Date.now(),
            });

            return resizedFile;

        } catch (error) {
            const message = error instanceof Error ? error.message : 'Error al procesar la imagen.';
            setMsgErr((prevState) => ({ ...prevState, err_photo: message }));
            return null;
        };

    };

    const handlePhotoChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const rawFile:File | undefined = e.target.files?.[0];

        const processedFile = await validPhoto(rawFile);

        if (processedFile) {
            setMsgErr((prev) => ({...prev, err_photo: ""}));
            setFormData((prev) => ({ ...prev, url_user_photo: processedFile }));
            setPhotoPreview(URL.createObjectURL(processedFile));
        }
    };

    const handleRemovePhoto = (e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        setFormData((prev) => ({ ...prev, url_user_photo: undefined }));
        if (photoPreview) {
            URL.revokeObjectURL(photoPreview);
        }

        setPhotoPreview(null);

        if (fileInputRefPhoto.current) {
            fileInputRefPhoto.current.value = "";
        }
    };

    //BLOCK OF NAME AND DESCRIPTION
    const validName = (value:string) => {
        if(!value.trim()){
            setMsgErr(prevState => ({...prevState, err_name:"El nombre de la subcomunidad es obligatorio"}));
            return;
        }
        if(value.length < MIN_NAME_LENGTH){
            setMsgErr(prevState => ({...prevState, err_name:`El nombre debe superar los ${MIN_NAME_LENGTH} caracteres.`}));
            return;
        }
        if(value.length > MAX_NAME_LENGTH){
            setMsgErr(prevState => ({...prevState, err_name:`El nombre no puede superar los ${MAX_NAME_LENGTH} caracteres.`}));
            return;
        }
        if(!generateSlug(value.trim())){
            setMsgErr(prevState => ({...prevState, err_name:"El nombre de la subcomunidad no es valido"}));
            return;
        } 

        setMsgErr(prevState => ({...prevState, err_name: ""}));
    };

    const handleChangeName = (e: ChangeEvent<HTMLInputElement>) => {
        const value:string = e.target.value;

        setFormData(prevState => ({
            ...prevState,
            name_community: value
        }));

        validName(value);
    };

    const validDescription = (value:string) => {
        if(!value.trim()){ 
            setMsgErr(prevState => ({...prevState, err_description: "La descripción de la subcomunidad es obligatoria"}));
            return;
        }
        if(value.length < MIN_DESCRIPTION_LENGTH){
            setMsgErr(prevState => ({...prevState, err_description:`La descripción debe superar los ${MIN_DESCRIPTION_LENGTH} caracteres`}));
            return;
        }
        if(value.length > MAX_DESCRIPTION_LENGTH){
            setMsgErr(prevState => ({...prevState, err_description:`La descripción no puede superar los ${MAX_DESCRIPTION_LENGTH} caracteres.`}));
            return;
        }

        setMsgErr(prevState => ({...prevState, err_description: ""}));
    };

    const handleChangeDescription = (e: ChangeEvent<HTMLTextAreaElement>) => {
        const value:string = e.target.value;

        setFormData(prevState => ({
            ...prevState,
            description_community: value
        }));

        validDescription(value);
    };

    if (!isOpen) return null;

    return(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 font-sans">
                <div className="flex justify-between items-center px-8 pt-6 pb-2">
                    <h2 className="text-xl font-bold text-gray-900 mx-auto pl-6">
                        Crear una Subcomunidad de {parentName}
                    </h2>
                    <button className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100" onClick={() => { setIsOpen(false); setMsgErr(ERR_DATA_FORM); setMsgErrSrv(""); }}>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <hr className="h-1 bg-gray-200 border-0"></hr>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <label className={`${isPending ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-60' : 'bg-gray-200 border-gray-300 cursor-pointer hover:bg-gray-300'} 
                        relative flex flex-col items-center justify-center h-28 w-full bg-gray-200 hover:bg-gray-250 rounded-2xl transition-all border-2 border-dashed border-transparent hover:border-gray-500 overflow-hidden group`}>
                                
                    {bannerPreview ? (
                        <div className="relative w-full h-full">
                            <Image src={bannerPreview} alt="Banner preview" className="w-full h-full object-cover rounded-2xl" fill unoptimized />
                                    
                            <button
                                type="button"
                                disabled={isPending}
                                onClick={handleRemoveBanner}
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
                            ref={fileInputRefBanner}
                            type="file" 
                            className="hidden" 
                            accept="image/*" 
                            onChange={handleBannerChange}
                            />
                    </label>

                    {msgErr.err_banner && 
                        <ErrAlert msg={msgErr.err_banner} />
                    }

                    <div className="bg-gray-100 rounded-2xl p-6">
                        <div className="md:col-span-7 space-y-5">
                        
                            <div className="flex items-center gap-3">
                                <div className="relative group">
                                <label
                                    className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 border-dashed border-transparent hover:border-gray-500 shadow-sm transition-all overflow-hidden relative ${
                                        isPending
                                        ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-60'
                                        : 'bg-gray-200 border-gray-300 cursor-pointer hover:bg-gray-300'
                                    }`}
                                    >
                                    {photoPreview ? (
                                        <Image src={photoPreview} alt="Profile preview" className="w-full h-full object-cover" fill unoptimized />
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
                                        ref={fileInputRefPhoto}
                                        type="file"
                                        disabled={isPending}
                                        className="hidden"
                                        accept="image/png, image/jpeg, image/webp"
                                        onChange={handlePhotoChange}
                                    />
                                </label>

                                {photoPreview && 
                                    <button
                                        disabled={isPending}
                                        type="button"
                                        onClick={handleRemovePhoto}
                                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 transition"
                                        title="Eliminar foto"
                                    >
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                }
                                </div>

                                <span className={`text-sm font-semibold ${isPending ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {photoPreview ? 'Cambiar foto de perfil' : 'Subir foto de perfil'}
                                </span>

                                {msgErr.err_photo && 
                                    <ErrAlert msg={msgErr.err_photo} />
                                }
                            </div>

                            <div className="space-y-1">
                                <label className="block text-base font-bold text-gray-900">Nombre de la subcomunidad</label>
                                <input
                                    type="text"
                                    placeholder="Escribe el nombre aqui..."
                                    name="name_community"
                                    disabled={isPending}
                                    value={formData.name_community}
                                    onChange={handleChangeName}
                                    autoComplete="off"
                                    className="w-full px-4 py-2 bg-white text-gray-900 rounded-md text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 
                                    placeholder-gray-400 shadow-sm hover:ring-2 hover:ring-blue-300 disabled:bg-gray-200 disabled:text-gray-800 disabled:border-gray-200 
                                    disabled:cursor-not-allowed disabled:opacity-75 transition-colors" />
                                <div className="flex justify-between items-center text-xs text-gray-600 min-h-[1rem]">
                                    <span id="user-text" className="truncate max-w-[80%]">
                                        /{generateSlug(parentName.trim())}/{generateSlug(formData.name_community.trim())}
                                    </span>
                                    <span className="ml-auto">
                                        <span id="char-count">{formData.name_community.length}</span>/{MAX_NAME_LENGTH}
                                    </span>
                                </div>
                                {msgErr.err_name && 
                                    <ErrAlert msg={msgErr.err_name} />
                                }
                            </div>

                            <div className="space-y-1">
                                <label className="block text-base font-bold text-gray-900">Descripción</label>
                                <textarea rows={4} 
                                    name="description_community"
                                    disabled={isPending} 
                                    value={formData.description_community}
                                    onChange={handleChangeDescription}
                                    className="w-full px-4 py-2 bg-white text-gray-900 rounded-md resize-none text-sm border border-gray-200 focus:outline-none focus:ring-2 
                                    focus:ring-blue-500 placeholder-gray-400 shadow-sm hover:ring-2 hover:ring-blue-300 disabled:bg-gray-200 disabled:text-gray-800 
                                    disabled:border-gray-200 disabled:cursor-not-allowed disabled:resize-none disabled:opacity-75 transition-colors" 
                                    placeholder="Escribe tu descripcion aqui..."></textarea>
                                <p className="text-right text-xs text-slate-500">
                                    {formData.description_community.length}/{MAX_DESCRIPTION_LENGTH}
                                </p>
                                {msgErr.err_description && 
                                    <ErrAlert msg={msgErr.err_description} />
                                }
                            </div>

                            <div className="pt-2">
                                <button
                                    disabled={isPending} 
                                    type="submit"
                                    className={`font-semibold px-8 py-2 rounded-full text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                                        isPending
                                        ? 'bg-green-300 cursor-not-allowed text-white opacity-80'
                                        : 'bg-green-500 hover:bg-green-600 text-white active:scale-95'
                                    }`}
                                    >
                                    Crear
                                </button>
                            </div>
                            
                            {msgErrSrv && 
                                <ErrAlert msg={msgErrSrv} />
                            }

                            {isPending && 
                                <div className="text-center">
                                    <Loader />
                                </div>
                            }

                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};