import filter from "leo-profanity";

export interface VerificationResult {
  isClean: boolean;
  flaggedWords: string[];
  filteredContent: string;
}

/**
 * Valida el contenido de un texto contra el diccionario profesional de 'leo-profanity'.
 * Utiliza límites de palabras completos para evitar falsos positivos y soporta multi-idioma.
 * @param content - El texto bruto que se va a verificar.
 * @returns Un objeto con el estado de limpieza, las palabras detectadas y el texto censurado.
 */
export function verifyContent(content: string): VerificationResult {
  filter.loadDictionary("en");

  const hasProfanity = filter.check(content);
  const filteredContent = filter.clean(content);
  const flaggedWords = hasProfanity 
    ? filter.list().filter(word => new RegExp(`\\b${word}\\b`, "gi").test(content))
    : [];

  return {
    isClean: !hasProfanity,
    flaggedWords,
    filteredContent
  };
}