const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const CONFIG = require('./config');

class ImageDownloader {
  constructor(outputDir) {
    this.outputDir = outputDir || CONFIG.OUTPUT_DIR;
    this.ensureDir(this.outputDir);
  }

  /**
   * Gera um nome de pasta baseado no caption do post
   */
  generateFolderName(caption, postType, index) {
    if (!caption || caption.length < 5) {
      return `${postType}_post_${index || Date.now()}`;
    }

    // Extrair as primeiras palavras significativas do caption
    let name = caption
      .replace(/[#@]\w+/g, '')           // Remover hashtags e mencoes
      .replace(/\n/g, ' ')               // Substituir quebras de linha
      .replace(/[^\w\sàáâãéêíóôõúüç-]/gi, '') // Manter apenas alfanumericos e acentos
      .trim()
      .split(/\s+/)
      .filter(w => w.length > 2)          // Filtrar palavras curtas
      .slice(0, 6)                        // Pegar ate 6 palavras
      .join('-')
      .toLowerCase()
      .replace(/-+/g, '-')               // Normalizar hifens
      .slice(0, 60);                      // Limitar tamanho

    if (!name || name.length < 3) {
      name = `${postType}_post_${Date.now()}`;
    }

    return `${postType}_${name}`;
  }

  /**
   * Baixa e salva todas as imagens de um post
   */
  async savePostImages(postData, profileName, postIndex) {
    const folderName = this.generateFolderName(
      postData.caption,
      postData.type,
      postIndex
    );

    // Criar subpasta: output/{perfil}/{nome-do-post}/
    const profileDir = path.join(this.outputDir, this.sanitizeName(profileName));
    const postDir = path.join(profileDir, folderName);
    this.ensureDir(postDir);

    const results = {
      folder: postDir,
      folderName,
      images: [],
      metadata: null,
    };

    // Baixar cada imagem
    for (let i = 0; i < postData.images.length; i++) {
      const imageUrl = postData.images[i];
      const ext = this.getExtension(imageUrl);
      const fileName = postData.type === CONFIG.CONTENT_TYPES.CAROUSEL
        ? `slide_${String(i + 1).padStart(2, '0')}${ext}`
        : `imagem${ext}`;

      const filePath = path.join(postDir, fileName);

      try {
        await this.downloadImage(imageUrl, filePath);
        results.images.push({
          file: fileName,
          path: filePath,
          url: imageUrl,
          slideNumber: i + 1,
        });
      } catch (err) {
        console.error(`  Erro ao baixar imagem ${i + 1}: ${err.message}`);
      }
    }

    // Salvar metadata do post
    const metadata = {
      url: postData.url,
      type: postData.type,
      caption: postData.caption,
      timestamp: postData.timestamp,
      totalImages: postData.images.length,
      downloadedAt: new Date().toISOString(),
      profile: profileName,
      images: results.images.map(img => ({
        file: img.file,
        slideNumber: img.slideNumber,
      })),
    };

    const metadataPath = path.join(postDir, 'metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    results.metadata = metadataPath;

    return results;
  }

  /**
   * Baixa uma imagem de uma URL
   */
  downloadImage(url, filePath) {
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https') ? https : http;

      const request = client.get(url, {
        headers: {
          'User-Agent': CONFIG.USER_AGENT,
          'Referer': 'https://www.instagram.com/',
          'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        },
      }, (response) => {
        // Seguir redirects
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          this.downloadImage(response.headers.location, filePath).then(resolve).catch(reject);
          return;
        }

        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}`));
          return;
        }

        const file = fs.createWriteStream(filePath);
        response.pipe(file);

        file.on('finish', () => {
          file.close();
          resolve(filePath);
        });

        file.on('error', (err) => {
          fs.unlink(filePath, () => {});
          reject(err);
        });
      });

      request.on('error', reject);
      request.setTimeout(30000, () => {
        request.destroy();
        reject(new Error('Timeout ao baixar imagem'));
      });
    });
  }

  /**
   * Gera relatorio resumido do scraping
   */
  generateReport(allResults, profileName) {
    const report = {
      profile: profileName,
      generatedAt: new Date().toISOString(),
      totalPosts: allResults.length,
      totalImages: allResults.reduce((acc, r) => acc + r.images.length, 0),
      posts: allResults.map(r => ({
        folder: r.folderName,
        imageCount: r.images.length,
      })),
    };

    const reportPath = path.join(this.outputDir, this.sanitizeName(profileName), 'relatorio.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    return report;
  }

  sanitizeName(name) {
    return name
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_+/g, '_')
      .toLowerCase();
  }

  getExtension(url) {
    const match = url.match(/\.(jpg|jpeg|png|webp|gif)/i);
    return match ? `.${match[1].toLowerCase()}` : '.jpg';
  }

  ensureDir(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

module.exports = ImageDownloader;
