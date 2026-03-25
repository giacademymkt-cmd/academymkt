const path = require('path');

const CONFIG = {
  // Diretorio padrao de saida das imagens
  OUTPUT_DIR: path.join(__dirname, '..', 'output'),

  // Tempo maximo de espera para carregamento de paginas (ms)
  PAGE_TIMEOUT: 30000,

  // Tempo maximo para requests HTTP (ms)
  REQUEST_TIMEOUT: 15000,

  // Delay entre acoes para evitar deteccao (ms)
  ACTION_DELAY: 2000,

  // Delay entre scroll de paginas (ms)
  SCROLL_DELAY: 1500,

  // Numero maximo de posts para scraping por perfil (0 = todos)
  MAX_POSTS_PER_PROFILE: 30,

  // Tipos de conteudo suportados
  CONTENT_TYPES: {
    CAROUSEL: 'carrossel',
    STATIC: 'post-estatico',
    VIDEO: 'video',
    REEL: 'reel',
  },

  // Arquivo de cookies para sessao
  COOKIES_FILE: path.join(__dirname, '..', 'cookies.json'),

  // User agent
  USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',

  // Viewport
  VIEWPORT: { width: 1366, height: 768 },
};

module.exports = CONFIG;
