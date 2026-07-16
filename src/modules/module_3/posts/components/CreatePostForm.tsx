"use client";

import { useState, useEffect } from "react";
import { createPostAction } from "@module_3/posts/actions/post";
import { getLinkMetadata } from "@module_3/posts/actions/links";

interface LinkMetadata {
  title: string;
  description: string;
  image: {
    url: string;
  };
}

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreatePostModal({isOpen, onClose}: CreatePostModalProps) {
  const [postText, setPostText] = useState("");
  const [urlInput, setUrlInput] = useState(""); // Este estado maneja el input de la URL
  const [tags, setTags] = useState(""); 
  const [file, setFile] = useState<File | null>(null); // Manejo del archivo opcional
  const [metadata, setMetadata] = useState<LinkMetadata | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ success: boolean; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Detectar cuando cambia el input de la URL directamente
  useEffect(() => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    if (urlInput.match(urlRegex)) {
      getPreview(urlInput.trim());
    } else {
      setMetadata(null); // Si limpian el input o no es URL válida, quitamos la miniatura
    }
  }, [urlInput]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const getPreview = async (url: string) => {
    setLoading(true);
    setMetadata(null);
    const data = await getLinkMetadata(url);
    if (data.success === 1 && data.meta) {
      setMetadata(data.meta);
    }
    setLoading(false);
  };

  const handlePublish = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatusMessage(null);

    const formData = new FormData();
    formData.append("postText", postText);
    formData.append("tags", tags);
    
    // Si hay una URL en el input y tenemos metadatos activos, se envía al backend
    if (urlInput.trim() && metadata) {
      formData.append("detectedUrl", urlInput.trim());
    }

    if (file) {
      formData.append("file", file);
    }

    try {
      const response = await createPostAction(formData);

      if (response.success) {
        setStatusMessage({ success: true, text: response.message || "¡Post creado con éxito!" });
        // Limpiar todo el formulario tras éxito
        setPostText("");
        setUrlInput("");
        setTags("");
        setFile(null);
        setMetadata(null);
        setTimeout(() => {
          onClose();
          setStatusMessage(null);
        }, 1200);
      } else {
        setStatusMessage({ success: false, text: response.error || "Ocurrió un error." });
      }
    } catch (error) {
      console.error(error);
      setStatusMessage({ success: false, text: "Error de red al conectar con el servidor." });
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl bg-[#121212] rounded-xl border border-gray-800 text-white p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-150">
        
        {/* Botón de cerrar superior */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition font-bold"
          title="Cerrar"
        >
          ✕
        </button>

        <h2 className="text-base font-semibold text-gray-300">Crear Nueva Publicación</h2>
        
        <form onSubmit={handlePublish} className="space-y-3">
          {/* Campo 1: Qué estás pensando */}
          <textarea
            name="postText"
            placeholder="¿Qué estás pensando?"
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            rows={3}
            className="w-full p-3 border border-gray-850 bg-[#1a1a1a] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500 resize-none text-sm"
          />

          {/* Campo 2: Input para la URL */}
          <input
            type="text"
            placeholder="Enlace opcional (ej: https://github.com/...)"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="w-full p-2.5 border border-gray-750 bg-[#1a1a1a] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-white placeholder-gray-500"
          />

          {/* Campo 3: Tags */}
          <input
            type="text"
            name="tags"
            placeholder="Tags separados por comas (ej: udo,sistemas,ayuda)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full p-2.5 border border-gray-750 bg-[#1a1a1a] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-white placeholder-gray-500"
          />

          {/* Campo 4: Selector de Archivo */}
          <div className="flex items-center space-x-3 text-sm">
            <label className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition font-medium">
              Seleccionar archivo
              <input 
                type="file" 
                className="hidden" 
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>
            <span className="text-gray-400 truncate max-w-xs">
              {file ? file.name : "Sin archivos seleccionados"}
            </span>
          </div>

          {/* Vista Previa Miniatura */}
          {loading && (
            <div className="p-4 bg-[#1a1a1a] rounded-xl border border-gray-800 text-center text-xs text-gray-400 animate-pulse">
              Generando vista previa del enlace...
            </div>
          )}

          {metadata && !loading && (
            <div className="relative group mt-2">
              <button
                type="button"
                onClick={() => setMetadata(null)}
                className="absolute top-2 right-2 z-10 bg-black/70 hover:bg-black text-white rounded-full p-1.5 text-xs transition border border-gray-700"
              >
                ✕
              </button>

              <a
                href={urlInput}
                target="_blank"
                rel="noopener noreferrer"
                className="block overflow-hidden bg-[#1a1a1a] rounded-xl border border-gray-800 hover:border-gray-700 transition"
              >
                {metadata.image.url && (
                  <div className="relative aspect-video w-full overflow-hidden bg-zinc-900 border-b border-gray-800">
                    <img
                      src={metadata.image.url}
                      alt={metadata.title}
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div className="p-3 space-y-1">
                  <p className="text-[11px] text-gray-500 truncate">
                    {(() => {
                      try { return new URL(urlInput).hostname; } 
                      catch { return "Enlace"; }
                    })()}
                  </p>
                  <h3 className="font-bold text-sm text-white line-clamp-1 group-hover:text-blue-400 transition">
                    {metadata.title || "Sin título"}
                  </h3>
                  <p className="text-xs text-gray-400 line-clamp-2">
                    {metadata.description || "Sin descripción disponible."}
                  </p>
                </div>
              </a>
            </div>
          )}

          {/* Feedback del Servidor */}
          {statusMessage && (
            <div className={`p-2.5 rounded-lg text-xs font-medium text-center ${statusMessage.success ? 'bg-emerald-950/50 border border-emerald-800 text-emerald-400' : 'bg-rose-950/50 border border-rose-800 text-rose-400'}`}>
              {statusMessage.text}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 border border-gray-700 text-gray-300 font-medium text-sm rounded-lg hover:bg-gray-850 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!postText.trim() || !tags.trim() || loading}
              className="px-5 py-1.5 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 disabled:bg-gray-800 disabled:text-gray-500 transition"
            >
              Publicar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}