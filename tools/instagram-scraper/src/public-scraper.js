const https = require('https');
const CONFIG = require('./config');

class PublicScraper {
  constructor() {
    this.headers = {
      'User-Agent': CONFIG.USER_AGENT,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept-Encoding': 'identity',
      'Connection': 'keep-alive',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
    };
  }

  /**
   * Faz request HTTPS e retorna o body como string
   */
  fetch(url, customHeaders) {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(url);
      const options = {
        hostname: parsedUrl.hostname,
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'GET',
        headers: { ...this.headers, ...customHeaders },
      };

      const req = https.request(options, (res) => {
        // Seguir redirects
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          let redirectUrl = res.headers.location;
          if (redirectUrl.startsWith('/')) {
            redirectUrl = `https://${parsedUrl.hostname}${redirectUrl}`;
          }
          this.fetch(redirectUrl, customHeaders).then(resolve).catch(reject);
          return;
        }

        if (res.statusCode === 403) {
          let data = '';
          res.on('data', chunk => { data += chunk; });
          res.on('end', () => resolve({ status: 403, body: data, headers: res.headers }));
          return;
        }

        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => resolve({ status: res.statusCode, body: data, headers: res.headers }));
      });

      req.on('error', (err) => {
        if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
          reject(new Error(`Sem acesso ao Instagram (${err.code}). Verifique sua conexao.`));
        } else {
          reject(err);
        }
      });
      req.setTimeout(CONFIG.REQUEST_TIMEOUT, () => { req.destroy(); reject(new Error('Timeout - Instagram pode estar bloqueando este IP')); });
      req.end();
    });
  }

  /**
   * Tenta extrair dados de um post via multiplas estrategias
   */
  async scrapePost(postUrl) {
    // Normalizar URL
    const shortcode = this.extractShortcode(postUrl);
    if (!shortcode) {
      throw new Error('URL invalida - nao foi possivel extrair o shortcode do post');
    }

    console.log(`  Shortcode: ${shortcode}`);

    // Estrategia 1: oEmbed API (sempre publica)
    console.log('  Tentando oEmbed API...');
    const oembed = await this.tryOembed(postUrl);

    // Estrategia 2: Pagina HTML com dados embedded
    console.log('  Tentando HTML scraping...');
    const htmlData = await this.tryHtmlScraping(shortcode);

    // Estrategia 3: GraphQL endpoint
    console.log('  Tentando GraphQL API...');
    const graphql = await this.tryGraphQL(shortcode);

    // Estrategia 4: __a=1 endpoint
    console.log('  Tentando __a=1 endpoint...');
    const apiData = await this.tryApiEndpoint(shortcode);

    // Combinar resultados de todas as estrategias
    return this.mergeResults(shortcode, postUrl, oembed, htmlData, graphql, apiData);
  }

  /**
   * Estrategia 1: oEmbed API - retorna info basica e thumbnail
   */
  async tryOembed(postUrl) {
    try {
      const oembedUrl = `https://api.instagram.com/oembed/?url=${encodeURIComponent(postUrl)}&omitscript=true`;
      const res = await this.fetch(oembedUrl);

      if (res.status === 200) {
        const data = JSON.parse(res.body);
        console.log(`    oEmbed: OK (titulo: "${(data.title || '').slice(0, 50)}...")`);
        return {
          title: data.title || '',
          authorName: data.author_name || '',
          authorUrl: data.author_url || '',
          thumbnailUrl: data.thumbnail_url || '',
          thumbnailWidth: data.thumbnail_width,
          thumbnailHeight: data.thumbnail_height,
          html: data.html || '',
        };
      }
      console.log(`    oEmbed: HTTP ${res.status}`);
      return null;
    } catch (err) {
      console.log(`    oEmbed: erro - ${err.message}`);
      return null;
    }
  }

  /**
   * Estrategia 2: Scraping da pagina HTML do post
   */
  async tryHtmlScraping(shortcode) {
    try {
      const url = `https://www.instagram.com/p/${shortcode}/`;
      const res = await this.fetch(url);

      if (res.status !== 200) {
        console.log(`    HTML: HTTP ${res.status}`);
        return null;
      }

      const html = res.body;
      const results = { images: [], caption: '', type: null, videoUrl: null };

      // Extrair dados do script __additionalDataLoaded ou window._sharedData
      const patterns = [
        /window\.__additionalDataLoaded\s*\(\s*['"][^'"]*['"]\s*,\s*({.+?})\s*\)\s*;/,
        /window\._sharedData\s*=\s*({.+?})\s*;/,
        /"PostPage":\s*\[({.+?})\]/,
      ];

      for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match) {
          try {
            const jsonData = JSON.parse(match[1]);
            const extracted = this.extractFromSharedData(jsonData);
            if (extracted) {
              console.log(`    HTML (sharedData): OK (${extracted.images.length} imagens)`);
              return extracted;
            }
          } catch { /* parse falhou, tentar proximo */ }
        }
      }

      // Tentar extrair meta tags
      const metaImages = this.extractMetaTags(html);
      if (metaImages.images.length > 0) {
        console.log(`    HTML (meta): OK (${metaImages.images.length} imagens)`);
        return metaImages;
      }

      // Tentar extrair de scripts com type="application/ld+json"
      const ldJson = this.extractLdJson(html);
      if (ldJson) {
        console.log(`    HTML (ld+json): OK`);
        return ldJson;
      }

      console.log('    HTML: nenhum dado estruturado encontrado');
      return null;
    } catch (err) {
      console.log(`    HTML: erro - ${err.message}`);
      return null;
    }
  }

  /**
   * Estrategia 3: GraphQL API
   */
  async tryGraphQL(shortcode) {
    try {
      // Query hash para media por shortcode
      const queryHash = '9f8827793ef34641b2fb195d4d41151c';
      const variables = JSON.stringify({ shortcode, child_comment_count: 0, fetch_comment_count: 0, parent_comment_count: 0, has_threaded_comments: false });
      const url = `https://www.instagram.com/graphql/query/?query_hash=${queryHash}&variables=${encodeURIComponent(variables)}`;

      const res = await this.fetch(url, {
        'X-IG-App-ID': '936619743392459',
        'X-Requested-With': 'XMLHttpRequest',
      });

      if (res.status === 200) {
        const data = JSON.parse(res.body);
        const media = data?.data?.shortcode_media;
        if (media) {
          const extracted = this.extractFromMediaNode(media);
          console.log(`    GraphQL: OK (${extracted.images.length} imagens, tipo: ${extracted.type})`);
          return extracted;
        }
      }
      console.log(`    GraphQL: HTTP ${res.status}`);
      return null;
    } catch (err) {
      console.log(`    GraphQL: erro - ${err.message}`);
      return null;
    }
  }

  /**
   * Estrategia 4: endpoint ?__a=1&__d=dis
   */
  async tryApiEndpoint(shortcode) {
    try {
      const url = `https://www.instagram.com/p/${shortcode}/?__a=1&__d=dis`;
      const res = await this.fetch(url, {
        'X-IG-App-ID': '936619743392459',
        'X-Requested-With': 'XMLHttpRequest',
      });

      if (res.status === 200) {
        try {
          const data = JSON.parse(res.body);
          const media = data?.graphql?.shortcode_media || data?.items?.[0];
          if (media) {
            const extracted = this.extractFromMediaNode(media);
            console.log(`    __a=1: OK (${extracted.images.length} imagens)`);
            return extracted;
          }
        } catch {
          // Pode retornar HTML ao inves de JSON
        }
      }
      console.log(`    __a=1: HTTP ${res.status}`);
      return null;
    } catch (err) {
      console.log(`    __a=1: erro - ${err.message}`);
      return null;
    }
  }

  /**
   * Extrai dados de um nodo de media do GraphQL
   */
  extractFromMediaNode(media) {
    const result = { images: [], caption: '', type: null, timestamp: null };

    // Caption
    const edges = media.edge_media_to_caption?.edges || [];
    result.caption = edges.length > 0 ? edges[0].node.text : '';

    // Timestamp
    result.timestamp = media.taken_at_timestamp
      ? new Date(media.taken_at_timestamp * 1000).toISOString()
      : null;

    // Tipo e imagens
    const typename = media.__typename || media.media_type;

    if (typename === 'GraphSidecar' || typename === 8 || media.edge_sidecar_to_children) {
      // Carrossel
      result.type = CONFIG.CONTENT_TYPES.CAROUSEL;
      const children = media.edge_sidecar_to_children?.edges || [];
      for (const edge of children) {
        const node = edge.node;
        const imgUrl = node.display_url || node.display_resources?.pop()?.src;
        if (imgUrl) result.images.push(imgUrl);
      }
    } else if (typename === 'GraphVideo' || typename === 2) {
      // Video
      result.type = CONFIG.CONTENT_TYPES.VIDEO;
      const thumb = media.display_url || media.thumbnail_src;
      if (thumb) result.images.push(thumb);
    } else {
      // Post estatico
      result.type = CONFIG.CONTENT_TYPES.STATIC;
      const imgUrl = media.display_url || media.display_resources?.pop()?.src;
      if (imgUrl) result.images.push(imgUrl);
    }

    return result;
  }

  /**
   * Extrai dados do window._sharedData
   */
  extractFromSharedData(data) {
    // Navegar pela estrutura do sharedData
    const postPage = data?.entry_data?.PostPage;
    if (postPage && postPage.length > 0) {
      const media = postPage[0]?.graphql?.shortcode_media;
      if (media) return this.extractFromMediaNode(media);
    }

    // Tentar estrutura alternativa
    const media = data?.graphql?.shortcode_media || data?.shortcode_media;
    if (media) return this.extractFromMediaNode(media);

    return null;
  }

  /**
   * Extrai imagens de meta tags OG
   */
  extractMetaTags(html) {
    const result = { images: [], caption: '', type: CONFIG.CONTENT_TYPES.STATIC };

    // og:image
    const ogImageRegex = /<meta\s+(?:property|name)="og:image"\s+content="([^"]+)"/gi;
    let match;
    while ((match = ogImageRegex.exec(html)) !== null) {
      result.images.push(match[1]);
    }

    // og:description como caption
    const descMatch = html.match(/<meta\s+(?:property|name)="og:description"\s+content="([^"]+)"/i);
    if (descMatch) {
      result.caption = this.decodeHtmlEntities(descMatch[1]);
    }

    // og:type pode indicar video
    const typeMatch = html.match(/<meta\s+(?:property|name)="og:type"\s+content="([^"]+)"/i);
    if (typeMatch && typeMatch[1].includes('video')) {
      result.type = CONFIG.CONTENT_TYPES.VIDEO;
    }

    // twitter:image como fallback
    if (result.images.length === 0) {
      const twitterImg = html.match(/<meta\s+(?:property|name)="twitter:image"\s+content="([^"]+)"/i);
      if (twitterImg) result.images.push(twitterImg[1]);
    }

    return result;
  }

  /**
   * Extrai dados de scripts ld+json
   */
  extractLdJson(html) {
    const regex = /<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
    let match;

    while ((match = regex.exec(html)) !== null) {
      try {
        const data = JSON.parse(match[1]);
        if (data['@type'] === 'ImageObject' || data['@type'] === 'VideoObject') {
          return {
            images: data.contentUrl ? [data.contentUrl] : [],
            caption: data.caption || data.description || '',
            type: data['@type'] === 'VideoObject' ? CONFIG.CONTENT_TYPES.VIDEO : CONFIG.CONTENT_TYPES.STATIC,
          };
        }
      } catch { /* skip */ }
    }
    return null;
  }

  /**
   * Scraping de lista de posts de um perfil publico
   */
  async scrapeProfile(username, maxPosts) {
    const limit = maxPosts || CONFIG.MAX_POSTS_PER_PROFILE;

    // Tentar via GraphQL profile endpoint
    console.log(`  Tentando carregar perfil @${username}...`);

    const profileData = await this.tryProfileGraphQL(username);
    if (!profileData) {
      // Fallback: HTML scraping do perfil
      return this.tryProfileHtml(username, limit);
    }

    const posts = [];
    const edges = profileData.edge_owner_to_timeline_media?.edges || [];

    for (const edge of edges.slice(0, limit)) {
      const node = edge.node;
      const shortcode = node.shortcode;
      if (shortcode) {
        posts.push(`https://www.instagram.com/p/${shortcode}/`);
      }
    }

    console.log(`  Encontrados ${posts.length} posts via API`);
    return posts;
  }

  /**
   * Tenta buscar dados do perfil via GraphQL
   */
  async tryProfileGraphQL(username) {
    try {
      const queryHash = 'c9100bf9110dd6361671f113dd02e7d6';
      const variables = JSON.stringify({ username, first: 50 });
      const url = `https://www.instagram.com/graphql/query/?query_hash=${queryHash}&variables=${encodeURIComponent(variables)}`;

      const res = await this.fetch(url, {
        'X-IG-App-ID': '936619743392459',
      });

      if (res.status === 200) {
        const data = JSON.parse(res.body);
        return data?.data?.user;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Fallback: extrair shortcodes do HTML do perfil
   */
  async tryProfileHtml(username, limit) {
    try {
      const res = await this.fetch(`https://www.instagram.com/${username}/`);
      if (res.status !== 200) return [];

      const shortcodeRegex = /\/p\/([\w-]+)\//g;
      const shortcodes = new Set();
      let match;

      while ((match = shortcodeRegex.exec(res.body)) !== null) {
        shortcodes.add(match[1]);
      }

      return Array.from(shortcodes)
        .slice(0, limit)
        .map(sc => `https://www.instagram.com/p/${sc}/`);
    } catch {
      return [];
    }
  }

  /**
   * Extrai shortcode de uma URL do Instagram
   */
  extractShortcode(url) {
    const match = url.match(/instagram\.com\/(?:p|reel|tv)\/([\w-]+)/);
    return match ? match[1] : null;
  }

  decodeHtmlEntities(str) {
    return str
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&#x27;/g, "'");
  }

  /**
   * Combina resultados de todas as estrategias, priorizando dados mais completos
   */
  mergeResults(shortcode, postUrl, oembed, htmlData, graphql, apiData) {
    // Prioridade: GraphQL > API > HTML > oEmbed
    const sources = [graphql, apiData, htmlData].filter(Boolean);

    const result = {
      url: postUrl,
      shortcode,
      type: CONFIG.CONTENT_TYPES.STATIC,
      caption: '',
      images: [],
      timestamp: null,
      profile: oembed?.authorName || '',
    };

    // Pegar o melhor resultado com imagens
    for (const source of sources) {
      if (source.images && source.images.length > 0) {
        result.images = source.images;
        result.type = source.type || result.type;
        result.caption = source.caption || result.caption;
        result.timestamp = source.timestamp || result.timestamp;
        break;
      }
    }

    // Se nenhuma estrategia retornou imagens, usar thumbnail do oEmbed
    if (result.images.length === 0 && oembed?.thumbnailUrl) {
      result.images.push(oembed.thumbnailUrl);
    }

    // Complementar caption com oEmbed se necessario
    if (!result.caption && oembed?.title) {
      result.caption = oembed.title;
    }

    // Complementar profile
    if (!result.profile && oembed?.authorName) {
      result.profile = oembed.authorName;
    }

    return result;
  }
}

module.exports = PublicScraper;
