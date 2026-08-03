"use client";

import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, SearchIcon } from './icons';

export interface SelectOption {
  id: string;
  name: string;
}

export interface PopoverSelectProps {
  label?: string;
  options: SelectOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  showSearchInput?: boolean;
  searchPlaceholder?: string;
  titleHeader?: string;
  popoverWidth?: string;
  originTop?: boolean;
  alignRight?: boolean;
  buttonClassName?: string;
  isOpen?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
}

export default function PopoverSelect({
  label,
  options,
  selectedValue,
  onSelect,
  showSearchInput = false,
  searchPlaceholder = "Buscar...",
  titleHeader,
  popoverWidth = "w-44",
  originTop = true,
  alignRight = false,
  buttonClassName,
  isOpen: controlledIsOpen,
  onToggle,
  onClose,
}: PopoverSelectProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const togglePopover = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
  };

  const closePopover = () => {
    if (onClose) {
      onClose();
    } else {
      setInternalIsOpen(false);
    }
  };

  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOptionName =
    options.find((option) => option.id === selectedValue)?.name || label || "Seleccionar";

  const headerTitle = titleHeader || label || "Opciones";

  const defaultButtonClass =
    "bg-lite-white hover:bg-white-gray text-main-black font-candal font-normal text-extra-tiny px-3.5 py-1 rounded-full flex items-center gap-1.5 transition-colors cursor-pointer border-0 max-w-[200px] sm:max-w-[240px] min-w-0";

  // Si tiene label fijo (ej: "Temas:", "Popular:"), muestra solo el label. Si no, muestra el valor seleccionado.
  const displayLabel = label || selectedOptionName;

  return (
    <div className="relative inline-block max-w-full">
      {/* Botón Desplegable */}
      <button
        type="button"
        onClick={togglePopover}
        className={buttonClassName || defaultButtonClass}
        title={displayLabel}
      >
        <span className="truncate inline-block min-w-0 flex-1 text-left">{displayLabel}</span>
        {isOpen ? (
          <ChevronUpIcon className="w-[9px] h-[5px] text-main-black shrink-0" />
        ) : (
          <ChevronDownIcon className="w-[9px] h-[5px] text-main-black shrink-0" />
        )}
      </button>

      {/* Popover Card Desplegable */}
      {isOpen && (
        <div
          className={`absolute ${alignRight ? 'right-0' : 'left-0'} ${
            originTop ? 'top-0' : 'top-full mt-2'
          } z-50 ${popoverWidth} bg-lite-white rounded-[16px] p-3 shadow-lg border border-white-gray flex flex-col justify-between animate-in fade-in zoom-in-95 duration-100 font-candal font-normal`}
        >
          {/* Cabecera del Popover */}
          <div className="flex items-center justify-between px-1 pb-1 border-b border-white-gray mb-1.5">
            <span className="font-candal font-normal text-extra-tiny text-main-black">{headerTitle}</span>
            <button
              type="button"
              onClick={closePopover}
              className="text-extra-tiny text-main-black cursor-pointer font-candal font-normal pl-2 border-0 bg-transparent"
            >
              <ChevronUpIcon className="w-[9px] h-[5px] text-main-black shrink-0" />
            </button>
          </div>

          {/* Lista de Opciones */}
          <div className="max-h-48 overflow-y-auto space-y-1 my-1 pr-0.5">
            {filteredOptions.length === 0 ? (
              <p className="text-extra-tiny font-candal font-normal text-gray-custom text-center py-1">
                Sin resultados
              </p>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  title={option.name}
                  onClick={() => {
                    onSelect(option.id);
                    closePopover();
                  }}
                  className={`w-full font-candal font-normal text-tiny py-1.5 px-3 rounded-full text-center transition-all cursor-pointer block border-0 truncate ${
                    selectedValue === option.id
                      ? 'bg-regular-blue text-pure-white'
                      : 'bg-white-gray hover:bg-gray-blue text-main-black'
                  }`}
                >
                  {option.name}
                </button>
              ))
            )}
          </div>

          {/* Campo de Búsqueda Interno (Opcional) */}
          {showSearchInput && (
            <div className="mt-2 pt-2 border-t border-white-gray">
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white-gray text-main-black font-candal font-normal text-extra-tiny pl-3.5 pr-8 py-1.5 rounded-full border-0 focus:outline-none placeholder:text-gray-custom"
                />
                <SearchIcon className="absolute right-3 w-3.5 h-3.5 text-main-black pointer-events-none" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
