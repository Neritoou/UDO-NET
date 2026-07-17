
const PALABRAS_PROHIBIDAS: string[] = [
  "mierda", "tarado", "gordo", "estupido", "idiota", "imbecil", "basura", 
  "inutil", "estupida", "idiot", "marico", "pendejo", "pendeja", "bobo", 
  "boba", "asno", "malparido", "prostituta", "puta", "puto", "perra", "odio",
  "spam", "ganasolas", "ganadinero", "criptoestafa", "compreaqui", "clickaqui", 
  "descuentofalso", "ganando", "seguidoresgratis", "bitcoins", "casino", 
  "apuestas", "regalo", "sorteo", "vendedor", "promocion", "invierte",
  "nazi", "facista", "comunista", "escoria", "rata", "plaga", "ladrón", 
  "corrupto", "asesino", "violador", "enfermo", "psicopata",
  "porno", "pornografía", "xxx", "hentai", "desnudo", "desnuda", "sexo", 
  "ereccion", "vagina", "pene"
];

// Interfaz para estructurar el retorno 
export interface ResultadoVerificacion {
  aprobado: boolean;
  motivo: string;
  palabrasBaneadas?: string[];
}

/**
 -Analiza el texto de una publicación o respuesta en busca de términos prohibidos.
 - Si encuentra coincidencias, retorna un estado de rechazo junto a la lista de palabras detectadas.
 - "texto" es el contenido a verificar.
 */
export function verificarContenido(texto: string): ResultadoVerificacion {
  const textoMinuscula = texto.toLowerCase();
  const palabrasDetectadas: string[] = [];

  PALABRAS_PROHIBIDAS.forEach((palabra) => {
    if (textoMinuscula.includes(palabra)) {
      palabrasDetectadas.push(palabra);
    }
  });

  if (palabrasDetectadas.length > 0) {
    return {
      aprobado: false,
      motivo: "Contiene lenguaje no permitido",
      palabrasBaneadas: palabrasDetectadas
    };
  }

  return {
    aprobado: true,
    motivo: "Post limpio"
  };
}