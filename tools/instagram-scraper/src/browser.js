const puppeteer = require('puppeteer-core');
const fs = require('fs');
const { execSync } = require('child_process');
const CONFIG = require('./config');

class BrowserManager {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  /**
   * Detecta caminho do Chrome/Chromium instalado no sistema
   */
  findChromePath() {
    const paths = [
      // Linux
      '/usr/bin/google-chrome',
      '/usr/bin/google-chrome-stable',
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser',
      '/snap/bin/chromium',
      // Mac
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
      // Windows
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    ];

    for (const p of paths) {
      try {
        if (fs.existsSync(p)) return p;
      } catch { /* skip */ }
    }

    // Tentar detectar via which/where
    try {
      const result = execSync('which google-chrome || which chromium || which chromium-browser 2>/dev/null', { encoding: 'utf-8' }).trim();
      if (result) return result;
    } catch { /* skip */ }

    return null;
  }

  async launch() {
    const chromePath = this.findChromePath();
    if (!chromePath) {
      throw new Error(
        'Chrome/Chromium nao encontrado. Instale o Google Chrome ou Chromium.\n' +
        '  Ubuntu/Debian: sudo apt install chromium-browser\n' +
        '  Mac: brew install --cask google-chrome\n' +
        '  Ou defina CHROME_PATH=/caminho/do/chrome'
      );
    }

    this.browser = await puppeteer.launch({
      executablePath: process.env.CHROME_PATH || chromePath,
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-features=site-per-process',
        '--window-size=1366,768',
      ],
    });

    this.page = await this.browser.newPage();
    await this.page.setViewport(CONFIG.VIEWPORT);
    await this.page.setUserAgent(CONFIG.USER_AGENT);

    // Esconde sinais de automacao
    await this.page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
      Object.defineProperty(navigator, 'languages', { get: () => ['pt-BR', 'pt', 'en-US', 'en'] });
    });

    return this.page;
  }

  async loadCookies() {
    if (!fs.existsSync(CONFIG.COOKIES_FILE)) {
      return false;
    }

    try {
      const cookiesData = fs.readFileSync(CONFIG.COOKIES_FILE, 'utf-8');
      const cookies = JSON.parse(cookiesData);
      await this.page.setCookie(...cookies);
      return true;
    } catch {
      return false;
    }
  }

  async saveCookies() {
    const cookies = await this.page.cookies();
    fs.writeFileSync(CONFIG.COOKIES_FILE, JSON.stringify(cookies, null, 2));
  }

  async login(username, password) {
    await this.page.goto('https://www.instagram.com/accounts/login/', {
      waitUntil: 'networkidle2',
      timeout: CONFIG.PAGE_TIMEOUT,
    });

    await this.delay(2000);

    // Aceitar cookies se o dialog aparecer
    try {
      const cookieButton = await this.page.$('button[class*="aOOlW"]');
      if (cookieButton) await cookieButton.click();
    } catch {
      // Dialog pode nao aparecer
    }

    await this.delay(1000);

    // Preencher credenciais
    const usernameInput = await this.page.$('input[name="username"]');
    const passwordInput = await this.page.$('input[name="password"]');

    if (!usernameInput || !passwordInput) {
      throw new Error('Nao foi possivel encontrar os campos de login');
    }

    await usernameInput.type(username, { delay: 80 });
    await this.delay(500);
    await passwordInput.type(password, { delay: 80 });
    await this.delay(500);

    // Clicar no botao de login
    const loginButton = await this.page.$('button[type="submit"]');
    if (loginButton) {
      await loginButton.click();
    }

    await this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
    await this.delay(3000);

    // Verificar se logou
    const currentUrl = this.page.url();
    if (currentUrl.includes('/accounts/login')) {
      throw new Error('Falha no login - verifique suas credenciais');
    }

    // Dispensar dialogos pos-login (salvar info, notificacoes)
    await this.dismissDialogs();

    // Salvar cookies para proxima sessao
    await this.saveCookies();

    return true;
  }

  async dismissDialogs() {
    // "Salvar suas informacoes de login?" / "Agora nao"
    try {
      await this.delay(2000);
      const buttons = await this.page.$$('button');
      for (const btn of buttons) {
        const text = await this.page.evaluate(el => el.textContent, btn);
        if (text && (text.includes('Agora não') || text.includes('Not Now') || text.includes('Agora n'))) {
          await btn.click();
          await this.delay(1500);
          break;
        }
      }
    } catch {
      // Ok se nao encontrar
    }

    // Dispensar dialog de notificacoes
    try {
      await this.delay(1000);
      const buttons = await this.page.$$('button');
      for (const btn of buttons) {
        const text = await this.page.evaluate(el => el.textContent, btn);
        if (text && (text.includes('Agora não') || text.includes('Not Now') || text.includes('Agora n'))) {
          await btn.click();
          await this.delay(1000);
          break;
        }
      }
    } catch {
      // Ok
    }
  }

  async isLoggedIn() {
    try {
      await this.page.goto('https://www.instagram.com/', {
        waitUntil: 'networkidle2',
        timeout: CONFIG.PAGE_TIMEOUT,
      });
      await this.delay(2000);
      const url = this.page.url();
      return !url.includes('/accounts/login');
    } catch {
      return false;
    }
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

module.exports = BrowserManager;
