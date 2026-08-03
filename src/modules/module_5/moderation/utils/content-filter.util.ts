import filter from "leo-profanity";

export interface VerificationResult {
  isClean: boolean;
  flaggedWords: string[];
  filteredContent: string;
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/1/g, 'i').replace(/!/g, 'i')
    .replace(/0/g, 'o')
    .replace(/@/g, 'a').replace(/4/g, 'a')
    .replace(/\$/g, 's').replace(/5/g, 's')
    .replace(/3/g, 'e');
}

/**
 * Valida el contenido de un texto contra el diccionario profesional de 'leo-profanity'.
 * Combina los diccionarios de inglés y español en memoria para soporte multi-idioma.
 * @param content - El texto bruto que se va a verificar.
 * @returns Un objeto con el estado de limpieza, las palabras detectadas y el texto censurado.
 */
export function verifyContent(content: string): VerificationResult {
  filter.loadDictionary("en");
  const enWords = filter.list();

  filter.loadDictionary("es");
  filter.add(enWords);

  const normalizedContent = normalizeText(content);
  const hasProfanity = filter.check(normalizedContent);
  
  let filteredContent = content;
  const flaggedWords: string[] = [];

  if (hasProfanity) {
    filter.list().forEach(word => {
      if (new RegExp(`\\b${word}\\b`, "gi").test(normalizedContent)) {
        flaggedWords.push(word);
        const regex = new RegExp(`\\b${word}\\b`, "gi");
        filteredContent = filteredContent.replace(regex, (match) => '*'.repeat(match.length));
      }
    });
  }

  return {
    isClean: !hasProfanity,
    flaggedWords,
    filteredContent
  };
}