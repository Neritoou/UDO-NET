"use client";

import { useState, useEffect } from "react";
import { createPostAction, CommunityOption } from "@module_3/posts/actions/post";
import { getLinkMetadata } from "@module_3/posts/actions/links";
import PopoverSelect from '../../components/PopoverSelect';
import UserAvatar from '../../components/UserAvatar';
import { CloseIcon } from '../../components/icons';

interface LinkMetadata {
  title?: string;
  description?: string;
  image?: { url?: string };
}

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCommunities?: CommunityOption[];
  initialCommunity?: string;
  userAvatar?: string;
  userName?: string;
}

export default function CreatePostModal({ 
  isOpen, 
  onClose, 
  initialCommunities = [],
  initialCommunity = "General", 
  userAvatar,
  userName = "Estudiante UDO"
}: CreatePostModalProps) {
  const [title, setTitle] = useState("");
  const [community, setCommunity] = useState(initialCommunity);
  const [communitiesList] = useState<CommunityOption[]>(initialCommunities);
  const [postText, setPostText] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [tags, setTags] = useState("");
  const [metadata, setMetadata] = useState<LinkMetadata | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ success: boolean; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Debounce para previsualizar metadata de URL
  useEffect(() => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const trimmedUrl = urlInput.trim();

    if (!trimmedUrl.match(urlRegex)) {
      setMetadata(null);
      setLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      getPreview(trimmedUrl);
    }, 1000);

    return () => clearTimeout(timer);
  }, [urlInput]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  const getPreview = async (url: string) => {
    setLoading(true);
    setMetadata(null);
    try {
      const data = (await getLinkMetadata(url)) as { success?: number; meta?: LinkMetadata };
      if (data.success === 1 && data.meta) setMetadata(data.meta);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!title.trim()) {
      setStatusMessage({ success: false, text: "El título de la publicación es obligatorio." });
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("communityId", community);
    formData.append("postText", postText);
    formData.append("tags", tags);

    if (urlInput.trim()) {
      formData.append("detectedUrl", urlInput.trim());
    }

    try {
      const response = await createPostAction(formData);

      if (response.success) {
        setStatusMessage({ success: true, text: response.message || "¡Post creado con éxito!" });
        setTitle("");
        setPostText("");
        setUrlInput("");
        setTags("");
        setMetadata(null);
        setTimeout(() => {
          onClose();
          setStatusMessage(null);
        }, 1200);
      } else {
        setStatusMessage({ success: false, text: response.error || "Ocurrió un error." });
      }
    } catch (error) {
      setStatusMessage({ success: false, text: "Error de red al conectar con el servidor." });
    }
  };

  if (!isOpen) return null;

  return (
    // Fondo semitransparente oscuro con desenfoque
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-alpha-black backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">

      {/* Contenedor del Modal */}
      <div className="relative w-full max-w-xl bg-pure-white rounded-[30px] text-main-black overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150 my-auto border border-white-gray">

        {/* Header del Modal */}
        <div className="relative flex items-center justify-center border-b-2 border-white-gray px-6 py-5 sm:px-8">

          {/* Título del Modal */}
          <h2 className="font-candal text-h4 font-normal text-main-black text-center">
            Crear Publicación
          </h2>

          {/* Botón de cerrar */}
          <button
            onClick={onClose}
            className="absolute right-6 text-main-black hover:text-deep-orange transition-transform duration-200 hover:scale-110 cursor-pointer"
            title="Cerrar"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body del Modal */}
        <form onSubmit={handlePublish} className="p-6 sm:p-8 space-y-5">

          {/* Usuario y Selección de Comunidad */}
          <div className="flex items-center space-x-3 pt-1">

            {/* Avatar */}
            <UserAvatar avatarUrl={userAvatar} username={userName} size="w-12 h-12" />

            {/* Nombre del Usuario */}
            <div className="flex flex-col space-y-1">
              <span className="font-candal text-p font-normal text-main-black leading-tight">
                {userName}
              </span>
              
              {/* Selector de Comunidad */}
              <PopoverSelect
                options={communitiesList}
                selectedValue={community}
                onSelect={(val) => setCommunity(val)}
                titleHeader="Comunidad"
                showSearchInput={true}
                popoverWidth="w-[135px]"
                originTop={true}
              />
            </div>
          </div>

          {/* Título de la Publicación */}
          <div className="space-y-1">
            <input
              type="text"
              name="title"
              placeholder="Título de la publicación..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 bg-lite-white text-main-black font-candal font-normal text-p placeholder:font-candal placeholder:font-normal placeholder:text-alpha-black rounded-xl focus:outline-none focus:ring-2 focus:ring-main-blue/50 border-0"
            />
          </div>

          {/* Caja Principal de Pregunta */}
          <div className="relative">
            <textarea
              name="postText"
              placeholder="Haz una pregunta..."
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              rows={4}
              required
              className="w-full p-4 border-2 border-main-blue/70 focus:border-main-blue bg-pure-white text-main-black font-candal font-normal text-p-plus placeholder:text-alpha-black placeholder:font-candal placeholder:font-normal rounded-[20px] focus:outline-none resize-none transition-all shadow-inner"
            />
          </div>

          {/* Controles Inferiores */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">

            {/* Input de Etiquetas */}
            <div className="flex-1 min-w-[180px]">
              <input
                type="text"
                name="tags"
                placeholder="Etiquetas (ej: ayuda, sistemas)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full bg-lite-white hover:bg-white-gray text-main-black font-open-sans font-extrabold text-tiny px-4 py-2.5 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-main-blue/50 placeholder:font-candal placeholder:font-normal placeholder:text-alpha-black"
              />
            </div>

            {/* Input de Enlace opcional */}
            <div className="flex-1 min-w-[180px]">
              <input
                type="url"
                placeholder="Adjuntar enlace..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="w-full bg-lite-white hover:bg-white-gray text-main-black font-candal font-normal text-tiny px-4 py-2.5 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-main-blue/50 placeholder:font-candal placeholder:font-normal placeholder:text-alpha-black"
              />
            </div>
          </div>

          {/* Previsualización de Metadatos de URL si existe */}
          {loading && (
            <div className="p-3 bg-lite-white rounded-xl text-center font-candal font-normal text-tiny text-gray-custom animate-pulse">
              Cargando vista previa del enlace...
            </div>
          )}

          {metadata && !loading && (
            <div className="relative group mt-2">
              <button
                type="button"
                onClick={() => setMetadata(null)}
                className="absolute top-3 right-3 z-10 text-main-black hover:text-deep-orange transition-transform duration-200 hover:scale-110 cursor-pointer"
                title="Quitar vista previa"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
              <a
                href={urlInput}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center overflow-hidden bg-lite-white rounded-2xl border-0 p-3 gap-3 transition-colors"
              >
                {metadata.image?.url && (
                  <img src={metadata.image.url} alt="Preview" className="w-20 h-20 object-cover rounded-xl shrink-0" />
                )}
                <div className="min-w-0 flex-1 space-y-1 font-candal font-normal pr-6">
                  <h4 className="text-tiny font-normal text-main-black truncate">{metadata.title || "Enlace"}</h4>
                  <p className="text-extra-tiny text-gray-custom line-clamp-2">{metadata.description}</p>
                </div>
              </a>
            </div>
          )}

          {/* Mensaje de Estado */}
          {statusMessage && (
            <div
              className={`p-3 rounded-2xl font-candal font-normal text-tiny text-center transition-all ${
                statusMessage.success
                  ? 'bg-regular-blue/15 text-regular-blue border border-regular-blue/30'
                  : 'bg-deep-orange/15 text-deep-orange border border-deep-orange/30'
              }`}
            >
              {statusMessage.text}
            </div>
          )}

          {/* Botón de Publicación */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={!postText.trim() || loading}
              className="px-10 py-3 bg-regular-blue hover:bg-dark-main-blue text-pure-white font-candal font-normal text-p rounded-2xl transition-all shadow-md active:scale-95 disabled:bg-white-gray disabled:text-gray-custom disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}