const fs = require('fs');
const path = require('path');
const CONFIG = require('./config');

class InstagramScraper {
  constructor(page) {
    this.page = page;
  }

  /**
   * Extrai dados de um post individual a partir da URL
   */
  async scrapePost(postUrl) {
    await this.page.goto(postUrl, {
      waitUntil: 'networkidle2',
      timeout: CONFIG.PAGE_TIMEOUT,
    });
    await this.delay(CONFIG.ACTION_DELAY);

    return await this.extractPostData();
  }

  /**
   * Extrai lista de URLs de posts de um perfil
   */
  async scrapeProfile(profileName, maxPosts) {
    const limit = maxPosts || CONFIG.MAX_POSTS_PER_PROFILE;
    const profileUrl = `https://www.instagram.com/${profileName}/`;

    await this.page.goto(profileUrl, {
      waitUntil: 'networkidle2',
      timeout: CONFIG.PAGE_TIMEOUT,
    });
    await this.delay(CONFIG.ACTION_DELAY);

    // Verificar se o perfil existe
    const notFound = await this.page.$('h2');
    if (notFound) {
      const text = await this.page.evaluate(el => el.textContent, notFound);
      if (text && text.includes('Sorry')) {
        throw new Error(`Perfil @${profileName} nao encontrado`);
      }
    }

    // Coletar links dos posts fazendo scroll
    const postUrls = await this.collectPostUrls(limit);

    return postUrls;
  }

  /**
   * Coleta URLs de posts scrollando a pagina do perfil
   */
  async collectPostUrls(limit) {
    const postUrls = new Set();
    let previousCount = 0;
    let staleRounds = 0;

    while (postUrls.size < limit && staleRounds < 3) {
      // Extrair links de posts visiveis
      const links = await this.page.evaluate(() => {
        const anchors = document.querySelectorAll('a[href*="/p/"], a[href*="/reel/"]');
        return Array.from(anchors)
          .map(a => a.href)
          .filter(href => href.match(/\/(p|reel)\/[\w-]+/));
      });

      links.forEach(url => {
        // Normalizar URL
        const match = url.match(/instagram\.com\/(p|reel)\/([\w-]+)/);
        if (match) {
          postUrls.add(`https://www.instagram.com/${match[1]}/${match[2]}/`);
        }
      });

      if (postUrls.size === previousCount) {
        staleRounds++;
      } else {
        staleRounds = 0;
      }
      previousCount = postUrls.size;

      if (postUrls.size >= limit) break;

      // Scroll para baixo
      await this.page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));
      await this.delay(CONFIG.SCROLL_DELAY);
    }

    return Array.from(postUrls).slice(0, limit);
  }

  /**
   * Extrai dados completos do post atual (imagens, caption, tipo)
   */
  async extractPostData() {
    const data = {
      url: this.page.url(),
      type: null,
      caption: '',
      images: [],
      timestamp: null,
      likes: null,
    };

    // Extrair caption
    data.caption = await this.extractCaption();

    // Detectar tipo de post e extrair imagens
    const isCarousel = await this.isCarousel();
    const isVideo = await this.isVideo();

    if (isVideo && !isCarousel) {
      data.type = CONFIG.CONTENT_TYPES.VIDEO;
      // Extrair thumbnail do video
      const thumbnail = await this.extractVideoThumbnail();
      if (thumbnail) data.images.push(thumbnail);
    } else if (isCarousel) {
      data.type = CONFIG.CONTENT_TYPES.CAROUSEL;
      data.images = await this.extractCarouselImages();
    } else {
      data.type = CONFIG.CONTENT_TYPES.STATIC;
      const image = await this.extractSingleImage();
      if (image) data.images.push(image);
    }

    // Extrair timestamp
    data.timestamp = await this.extractTimestamp();

    return data;
  }

  /**
   * Verifica se o post atual eh um carrossel
   */
  async isCarousel() {
    return await this.page.evaluate(() => {
      // Botao de proximo slide
      const nextBtn = document.querySelector('button[aria-label="Next"], button[aria-label="Próximo"], button[aria-label="Go to next slide"]');
      // Indicadores de slide (bolinhas)
      const dots = document.querySelector('div[class*="indicators"], div[role="tablist"]');
      // Multiplas imagens no container
      const carouselList = document.querySelector('ul[class*="carousel"], div[class*="Carousel"]');

      return !!(nextBtn || dots || carouselList);
    });
  }

  /**
   * Verifica se o post eh um video/reel
   */
  async isVideo() {
    return await this.page.evaluate(() => {
      const video = document.querySelector('article video, div[role="presentation"] video');
      return !!video;
    });
  }

  /**
   * Extrai todas as imagens de um carrossel navegando entre slides
   */
  async extractCarouselImages() {
    const images = [];
    let slideIndex = 0;
    let maxSlides = 20; // Limite de seguranca

    while (slideIndex < maxSlides) {
      await this.delay(800);

      // Extrair imagem do slide atual
      const imgSrc = await this.page.evaluate(() => {
        // Procura a imagem principal no artigo
        const article = document.querySelector('article');
        if (!article) return null;

        // Imagens no container principal do post
        const imgs = article.querySelectorAll('div[role="presentation"] img, ul li img, div[class*="media"] img');
        const visible = Array.from(imgs).filter(img => {
          const rect = img.getBoundingClientRect();
          const style = window.getComputedStyle(img);
          return rect.width > 100 && style.visibility !== 'hidden' && style.opacity !== '0' && img.src && !img.src.includes('profile');
        });

        // Pegar a imagem visivel de maior resolucao
        if (visible.length > 0) {
          const sorted = visible.sort((a, b) => {
            return (b.naturalWidth * b.naturalHeight) - (a.naturalWidth * a.naturalHeight);
          });
          return sorted[0].src;
        }

        // Fallback: qualquer img grande no artigo
        const allImgs = article.querySelectorAll('img');
        const large = Array.from(allImgs).filter(img =>
          img.width > 200 && img.src && !img.src.includes('profile') && !img.src.includes('avatar')
        );
        return large.length > 0 ? large[0].src : null;
      });

      if (imgSrc && !images.includes(imgSrc)) {
        images.push(imgSrc);
      }

      // Tentar ir para o proximo slide
      const hasNext = await this.page.evaluate(() => {
        const nextBtn = document.querySelector(
          'button[aria-label="Next"], button[aria-label="Próximo"], button[aria-label="Go to next slide"]'
        );
        if (nextBtn && !nextBtn.disabled) {
          nextBtn.click();
          return true;
        }
        return false;
      });

      if (!hasNext) break;
      slideIndex++;
      await this.delay(1000);
    }

    return images;
  }

  /**
   * Extrai imagem de um post estatico
   */
  async extractSingleImage() {
    return await this.page.evaluate(() => {
      const article = document.querySelector('article');
      if (!article) return null;

      const imgs = article.querySelectorAll('img');
      const candidates = Array.from(imgs).filter(img =>
        img.width > 200 && img.src && !img.src.includes('profile') && !img.src.includes('avatar')
      );

      if (candidates.length === 0) return null;

      // Retornar a de maior resolucao
      const sorted = candidates.sort((a, b) =>
        (b.naturalWidth * b.naturalHeight) - (a.naturalWidth * a.naturalHeight)
      );
      return sorted[0].src;
    });
  }

  /**
   * Extrai thumbnail de video
   */
  async extractVideoThumbnail() {
    return await this.page.evaluate(() => {
      const article = document.querySelector('article');
      if (!article) return null;

      const video = article.querySelector('video');
      if (video && video.poster) return video.poster;

      // Fallback: imagem de preview
      const img = article.querySelector('img[src*="video"]');
      return img ? img.src : null;
    });
  }

  /**
   * Extrai o caption/legenda do post
   */
  async extractCaption() {
    return await this.page.evaluate(() => {
      // Procurar no container do caption
      const selectors = [
        'div[class*="Caption"] span',
        'article h1 + div span',
        'article ul li:first-child span:not([class*="username"])',
        'article div[role="presentation"] + div span',
      ];

      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el && el.textContent && el.textContent.length > 10) {
          return el.textContent.trim().slice(0, 500);
        }
      }

      // Fallback: meta description
      const meta = document.querySelector('meta[property="og:description"]');
      if (meta) return meta.content || '';

      return '';
    });
  }

  /**
   * Extrai timestamp do post
   */
  async extractTimestamp() {
    return await this.page.evaluate(() => {
      const timeEl = document.querySelector('article time[datetime]');
      return timeEl ? timeEl.getAttribute('datetime') : null;
    });
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = InstagramScraper;
