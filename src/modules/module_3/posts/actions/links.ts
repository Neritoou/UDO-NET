"use server";

import axios from 'axios';
import * as cheerio from 'cheerio';

function decodeHtmlEntities(text: string): string {
  if (!text) return '';
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

function isPrivateIPv4(hostname: string): boolean {
  const parts = hostname.split('.');
  if (parts.length !== 4) return false;
  const first = parseInt(parts[0], 10);
  const second = parseInt(parts[1], 10);
  if (isNaN(first) || isNaN(second)) return false;

  if (first === 10) return true; // 10.0.0.0/8
  if (first === 172 && second >= 16 && second <= 31) return true; // 172.16.0.0/12
  if (first === 192 && second === 168) return true; // 192.168.0.0/16
  if (first === 127) return true; // loopback
  if (first === 0) return true; // 0.0.0.0/8
  return false;
}

function getYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

function validateUrl(input: string): URL {
  const parsed = new URL(input);
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Only HTTP/HTTPS URLs are allowed');
  }

  const hostname = parsed.hostname.toLowerCase();
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
    throw new Error('Localhost is not allowed');
  }

  const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Pattern.test(hostname) && isPrivateIPv4(hostname)) {
    throw new Error('Private IP addresses are not allowed');
  }

  return parsed;
}

function resolveRelativeUrl(base: string, relative: string): string {
  try {
    return new URL(relative, base).href;
  } catch {
    return relative;
  }
}

async function fetchYouTubeMetadata(videoId: string, url: string) {
  const fallbackImage = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  // Try oEmbed first
  try {
    const oembedRes = await axios.get(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
      { timeout: 3000 }
    );
    const data = oembedRes.data;
    return {
      success: 1 as const,
      meta: {
        title: decodeHtmlEntities(data.title || 'YouTube Video'),
        description: decodeHtmlEntities(data.author_name || ''),
        image: {
          url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        },
      },
    };
  } catch {
    try {
      const pageRes = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        timeout: 4000,
        maxContentLength: 5 * 1024 * 1024,
        responseType: 'arraybuffer', // to handle possible binary
      });
      const html = pageRes.data.toString();
      const $ = cheerio.load(html);
      const title = decodeHtmlEntities(
        $('meta[property="og:title"]').attr('content') || $('title').text() || 'YouTube Video'
      );
      const description = decodeHtmlEntities(
        $('meta[property="og:description"]').attr('content') ||
        $('meta[name="description"]').attr('content') || ''
      );
      let image = $('meta[property="og:image"]').attr('content') ||
                  $('link[itemprop="thumbnailUrl"]').attr('href') || '';
      if (image) image = resolveRelativeUrl(url, image);
      return {
        success: 1 as const,
        meta: { title, description, image: { url: image || fallbackImage } },
      };
    } catch {
      return {
        success: 1 as const,
        meta: {
          title: 'YouTube Video',
          description: 'Haz clic para abrir el enlace del video directamente en YouTube.',
          image: { url: fallbackImage },
        },
      };
    }
  }
}

async function fetchGenericMetadata(
  url: string,
  redirectCount = 0
): Promise<{ success: 1; meta: { title: string; description: string; image: { url: string } } }> {
  const MAX_REDIRECTS = 5;
  if (redirectCount > MAX_REDIRECTS) {
    throw new Error('Too many redirects');
  }

  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'es-ES,es;q=0.9',
    },
    timeout: 5000,
    maxContentLength: 5 * 1024 * 1024,
    responseType: 'arraybuffer',
    validateStatus: () => true,
  });

  const contentType = String(response.headers['content-type'] || '');
  if (contentType.startsWith('image/')) {
    const fileName = new URL(url).pathname.split('/').pop() || 'Imagen';
    return {
      success: 1 as const,
      meta: {
        title: fileName,
        description: '',
        image: { url },
      },
    };
  }

  let html = '';
  try {
    html = response.data.toString();
  } catch {
  }

  if (!html.trim()) {
    const hostname = new URL(url).hostname;
    return {
      success: 1 as const,
      meta: {
        title: hostname || 'Enlace',
        description: 'No se pudo obtener contenido de la página.',
        image: { url: '' },
      },
    };
  }

  const $ = cheerio.load(html);

  const metaRefresh = $('meta[http-equiv="refresh"]').attr('content');
  if (metaRefresh) {
    const match = metaRefresh.match(/url=(.+)/i);
    if (match && match[1]) {
      let redirectUrl = match[1].trim();
      try {
        redirectUrl = new URL(redirectUrl, url).href;
      } catch {
      }
      return await fetchGenericMetadata(redirectUrl, redirectCount + 1);
    }
  }

  const title = decodeHtmlEntities(
    $('meta[property="og:title"]').attr('content') || $('title').text() || ''
  );
  const description = decodeHtmlEntities(
    $('meta[property="og:description"]').attr('content') ||
    $('meta[name="description"]').attr('content') || ''
  );
  let imageUrl = $('meta[property="og:image"]').attr('content') ||
                 $('meta[name="twitter:image"]').attr('content') ||
                 $('link[rel="image_src"]').attr('href') || '';

  if (imageUrl) {
    imageUrl = resolveRelativeUrl(url, imageUrl);
  }

  const finalTitle = title || new URL(url).pathname.split('/').pop() || 'Enlace';

  return {
    success: 1 as const,
    meta: {
      title: finalTitle,
      description,
      image: { url: imageUrl },
    },
  };
}

export async function getLinkMetadata(inputUrl: string) {
  try {
    if (!inputUrl) {
      return { success: 0 as const, error: 'URL inválida o vacía' };
    }

    const validated = validateUrl(inputUrl);
    const url = validated.href;

    const ytId = getYouTubeId(url);
    if (ytId) {
      return await fetchYouTubeMetadata(ytId, url);
    }

    return await fetchGenericMetadata(url);
  } catch (error) {
    console.error('Error en getLinkMetadata:', error);
    return {
      success: 0 as const,
      error: error instanceof Error ? error.message : 'No se pudo obtener la previsualización del enlace.',
    };
  }
}
