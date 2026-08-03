"use client";

import React, { useState, InputHTMLAttributes } from 'react';
import { useRouter } from 'next/navigation';

export interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch?: (term: string) => void;
  targetPath?: string;
  className?: string;
}

export default function SearchInput({
  placeholder = "Buscar...",
  value: controlledValue,
  onChange: controlledOnChange,
  onSearch,
  targetPath,
  className = "",
  ...props
}: SearchInputProps) {
  const router = useRouter();
  const [internalTerm, setInternalTerm] = useState("");

  const isControlled = controlledValue !== undefined;
  const currentTerm = isControlled ? controlledValue : internalTerm;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isControlled && controlledOnChange) {
      controlledOnChange(e);
    } else {
      setInternalTerm(e.target.value);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const termToSubmit = currentTerm.trim();
    if (!termToSubmit) return;

    if (onSearch) {
      onSearch(termToSubmit);
    }

    if (targetPath) {
      router.push(`${targetPath}?q=${encodeURIComponent(termToSubmit)}`);
    }
  };

  const inputElement = (
    <input
      type="text"
      placeholder={placeholder}
      value={currentTerm}
      onChange={handleInputChange}
      className={`w-full h-[42px] bg-lite-white text-main-black font-open-sans font-extrabold text-p placeholder:font-open-sans placeholder:font-extrabold placeholder:text-alpha-black px-5 rounded-full focus:outline-none border-0 transition-colors ${className}`}
      {...props}
    />
  );

  // Si se usa controlado dentro de un form externo (ej: SearchBox), renderiza solo el input
  if (isControlled && !targetPath && !onSearch) {
    return inputElement;
  }

  // Si se usa independiente (ej: Header/Feed principal), maneja el submit y la redirección automática
  return (
    <form onSubmit={handleSubmit} className="w-full">
      {inputElement}
    </form>
  );
}
