#!/usr/bin/env node

const { program } = require('commander');
const ora = require('ora');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const BrowserManager = require('./src/browser');
const InstagramScraper = require('./src/scraper');
const ImageDownloader = require('./src/downloader');
const CONFIG = require('./src/config');

// ============================================================
// CLI - Instagram Scraper para GI Academy
// ============================================================

program
  .name('ig-scraper')
  .description('Ferramenta de scraping do Instagram para banco de dados visual')
  .version('1.0.0');

// ----------------------------------------------------------
// Comando: login
// ----------------------------------------------------------
program
  .command('login')
  .description('Fazer login no Instagram e salvar sessao')
  .requiredOption('-u, --username <username>', 'Nome de usuario do Instagram')
  .requiredOption('-p, --password <password>', 'Senha do Instagram')
  .action(async (opts) => {
    const spinner = ora('Iniciando login no Instagram...').start();
    const browser = new BrowserManager();

    try {
      await browser.launch();
      spinner.text = 'Acessando pagina de login...';
      await browser.login(opts.username, opts.password);
      spinner.succeed(chalk.green('Login realizado com sucesso! Cookies salvos.'));
    } catch (err) {
      spinner.fail(chalk.red(`Erro no login: ${err.message}`));
    } finally {
      await browser.close();
    }
  });

// ----------------------------------------------------------
// Comando: perfil
// ----------------------------------------------------------
program
  .command('perfil <username>')
  .description('Scraping de todos os posts de um perfil')
  .option('-n, --max <number>', 'Numero maximo de posts', parseInt, 30)
  .option('-o, --output <dir>', 'Diretorio de saida', CONFIG.OUTPUT_DIR)
  .option('--tipo <tipo>', 'Filtrar por tipo: carrossel, post-estatico, video', '')
  .action(async (username, opts) => {
    const spinner = ora(`Preparando scraping do perfil @${username}...`).start();
    const browser = new BrowserManager();
    const downloader = new ImageDownloader(opts.output);

    try {
      // Iniciar browser e verificar sessao
      await browser.launch();
      spinner.text = 'Carregando sessao...';
      const hasCookies = await browser.loadCookies();

      if (!hasCookies) {
        spinner.fail(chalk.red('Sessao nao encontrada. Execute primeiro: ig-scraper login -u <user> -p <senha>'));
        await browser.close();
        return;
      }

      const loggedIn = await browser.isLoggedIn();
      if (!loggedIn) {
        spinner.fail(chalk.red('Sessao expirada. Execute novamente: ig-scraper login -u <user> -p <senha>'));
        await browser.close();
        return;
      }

      spinner.succeed(chalk.green('Sessao ativa!'));

      // Coletar URLs dos posts
      const scraper = new InstagramScraper(browser.page);
      spinner.start(`Coletando posts de @${username}...`);
      const postUrls = await scraper.scrapeProfile(username, opts.max);
      spinner.succeed(chalk.green(`${postUrls.length} posts encontrados em @${username}`));

      if (postUrls.length === 0) {
        console.log(chalk.yellow('Nenhum post encontrado.'));
        await browser.close();
        return;
      }

      // Processar cada post
      const allResults = [];
      let skipped = 0;

      for (let i = 0; i < postUrls.length; i++) {
        const url = postUrls[i];
        spinner.start(`Processando post ${i + 1}/${postUrls.length}...`);

        try {
          const postData = await scraper.scrapePost(url);

          // Filtrar por tipo se especificado
          if (opts.tipo && postData.type !== opts.tipo) {
            skipped++;
            continue;
          }

          // Pular videos (sem imagens para baixar)
          if (postData.images.length === 0) {
            spinner.warn(chalk.yellow(`Post ${i + 1}: sem imagens para baixar`));
            skipped++;
            continue;
          }

          // Baixar imagens
          const result = await downloader.savePostImages(postData, username, i + 1);
          allResults.push(result);

          const tipoLabel = postData.type === 'carrossel'
            ? chalk.cyan(`carrossel (${postData.images.length} slides)`)
            : chalk.blue(postData.type);

          spinner.succeed(
            `Post ${i + 1}/${postUrls.length}: ${tipoLabel} -> ${chalk.gray(result.folderName)}`
          );
        } catch (err) {
          spinner.warn(chalk.yellow(`Post ${i + 1}: erro - ${err.message}`));
        }
      }

      // Gerar relatorio
      if (allResults.length > 0) {
        const report = downloader.generateReport(allResults, username);

        console.log('\n' + chalk.green.bold('=== Scraping concluido! ==='));
        console.log(chalk.white(`  Perfil:          @${username}`));
        console.log(chalk.white(`  Posts baixados:   ${allResults.length}`));
        console.log(chalk.white(`  Posts ignorados:  ${skipped}`));
        console.log(chalk.white(`  Total de imagens: ${report.totalImages}`));
        console.log(chalk.white(`  Saida:            ${opts.output}/${username}`));
        console.log('');
      } else {
        console.log(chalk.yellow('\nNenhum post processado com sucesso.'));
      }
    } catch (err) {
      spinner.fail(chalk.red(`Erro: ${err.message}`));
    } finally {
      await browser.close();
    }
  });

// ----------------------------------------------------------
// Comando: post
// ----------------------------------------------------------
program
  .command('post <url>')
  .description('Scraping de um post especifico pela URL')
  .option('-o, --output <dir>', 'Diretorio de saida', CONFIG.OUTPUT_DIR)
  .option('--nome <nome>', 'Nome customizado para a pasta do post')
  .action(async (url, opts) => {
    // Validar URL
    if (!url.includes('instagram.com')) {
      console.log(chalk.red('URL invalida. Use uma URL do Instagram (ex: https://www.instagram.com/p/ABC123/)'));
      return;
    }

    const spinner = ora('Preparando scraping do post...').start();
    const browser = new BrowserManager();
    const downloader = new ImageDownloader(opts.output);

    try {
      await browser.launch();
      spinner.text = 'Carregando sessao...';
      const hasCookies = await browser.loadCookies();

      if (!hasCookies) {
        spinner.fail(chalk.red('Sessao nao encontrada. Execute primeiro: ig-scraper login -u <user> -p <senha>'));
        await browser.close();
        return;
      }

      const loggedIn = await browser.isLoggedIn();
      if (!loggedIn) {
        spinner.fail(chalk.red('Sessao expirada. Execute novamente: ig-scraper login -u <user> -p <senha>'));
        await browser.close();
        return;
      }

      spinner.succeed(chalk.green('Sessao ativa!'));

      // Scraping do post
      const scraper = new InstagramScraper(browser.page);
      spinner.start('Extraindo dados do post...');
      const postData = await scraper.scrapePost(url);

      if (postData.images.length === 0) {
        spinner.fail(chalk.red('Nenhuma imagem encontrada neste post.'));
        await browser.close();
        return;
      }

      // Extrair nome do perfil da URL ou usar generico
      const profileMatch = url.match(/instagram\.com\/([^/]+)/);
      const profileName = profileMatch ? profileMatch[1] : 'post-avulso';

      // Se nome customizado foi informado, sobrescrever o caption
      if (opts.nome) {
        postData.caption = opts.nome;
      }

      spinner.text = 'Baixando imagens...';
      const result = await downloader.savePostImages(postData, profileName, 1);

      const tipoLabel = postData.type === 'carrossel'
        ? `Carrossel (${postData.images.length} slides)`
        : postData.type === 'post-estatico'
        ? 'Post estatico'
        : postData.type;

      spinner.succeed(chalk.green('Post processado com sucesso!'));

      console.log('\n' + chalk.green.bold('=== Resultado ==='));
      console.log(chalk.white(`  Tipo:     ${tipoLabel}`));
      console.log(chalk.white(`  Imagens:  ${result.images.length}`));
      console.log(chalk.white(`  Pasta:    ${result.folder}`));

      if (postData.caption) {
        const captionPreview = postData.caption.slice(0, 100) + (postData.caption.length > 100 ? '...' : '');
        console.log(chalk.white(`  Caption:  ${captionPreview}`));
      }
      console.log('');
    } catch (err) {
      spinner.fail(chalk.red(`Erro: ${err.message}`));
    } finally {
      await browser.close();
    }
  });

// ----------------------------------------------------------
// Comando: listar
// ----------------------------------------------------------
program
  .command('listar')
  .description('Listar todo conteudo ja baixado')
  .option('-o, --output <dir>', 'Diretorio de saida', CONFIG.OUTPUT_DIR)
  .action((opts) => {
    const outputDir = opts.output;

    if (!fs.existsSync(outputDir)) {
      console.log(chalk.yellow('Nenhum conteudo baixado ainda.'));
      return;
    }

    const profiles = fs.readdirSync(outputDir).filter(f =>
      fs.statSync(path.join(outputDir, f)).isDirectory()
    );

    if (profiles.length === 0) {
      console.log(chalk.yellow('Nenhum conteudo baixado ainda.'));
      return;
    }

    console.log(chalk.green.bold('\n=== Banco de Dados Visual ===\n'));

    let totalPosts = 0;
    let totalImages = 0;

    for (const profile of profiles) {
      const profileDir = path.join(outputDir, profile);
      const posts = fs.readdirSync(profileDir).filter(f =>
        fs.statSync(path.join(profileDir, f)).isDirectory()
      );

      console.log(chalk.cyan.bold(`  @${profile} (${posts.length} posts)`));

      for (const post of posts) {
        const postDir = path.join(profileDir, post);
        const metadataPath = path.join(postDir, 'metadata.json');

        let meta = {};
        if (fs.existsSync(metadataPath)) {
          meta = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
        }

        const imageFiles = fs.readdirSync(postDir).filter(f =>
          /\.(jpg|jpeg|png|webp|gif)$/i.test(f)
        );

        const tipo = meta.type || 'desconhecido';
        console.log(chalk.white(`    ${chalk.gray('├─')} ${post} ${chalk.gray(`[${tipo}] (${imageFiles.length} imgs)`)}`));

        totalPosts++;
        totalImages += imageFiles.length;
      }
      console.log('');
    }

    console.log(chalk.green(`  Total: ${totalPosts} posts, ${totalImages} imagens\n`));
  });

// ----------------------------------------------------------
// Comando: exportar
// ----------------------------------------------------------
program
  .command('exportar')
  .description('Exportar indice completo do banco visual em JSON')
  .option('-o, --output <dir>', 'Diretorio de saida', CONFIG.OUTPUT_DIR)
  .option('-f, --file <file>', 'Arquivo de saida', '')
  .action((opts) => {
    const outputDir = opts.output;

    if (!fs.existsSync(outputDir)) {
      console.log(chalk.yellow('Nenhum conteudo para exportar.'));
      return;
    }

    const index = {
      exportedAt: new Date().toISOString(),
      profiles: {},
    };

    const profiles = fs.readdirSync(outputDir).filter(f =>
      fs.statSync(path.join(outputDir, f)).isDirectory()
    );

    for (const profile of profiles) {
      const profileDir = path.join(outputDir, profile);
      const posts = fs.readdirSync(profileDir).filter(f =>
        fs.statSync(path.join(profileDir, f)).isDirectory()
      );

      index.profiles[profile] = [];

      for (const post of posts) {
        const metadataPath = path.join(profileDir, post, 'metadata.json');
        if (fs.existsSync(metadataPath)) {
          const meta = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
          meta.localFolder = path.join(profileDir, post);
          index.profiles[profile].push(meta);
        }
      }
    }

    const exportFile = opts.file || path.join(outputDir, 'indice-visual.json');
    fs.writeFileSync(exportFile, JSON.stringify(index, null, 2));
    console.log(chalk.green(`Indice exportado para: ${exportFile}`));
  });

program.parse(process.argv);

// Mostrar ajuda se nenhum comando
if (!process.argv.slice(2).length) {
  console.log(chalk.cyan.bold('\n  Instagram Scraper - GI Academy\n'));
  console.log(chalk.white('  Ferramenta para criar banco de dados visual'));
  console.log(chalk.white('  de conteudo do Instagram para o agente designer.\n'));
  program.outputHelp();
  console.log('');
  console.log(chalk.gray('  Exemplos:'));
  console.log(chalk.gray('    $ node index.js login -u meuuser -p minhasenha'));
  console.log(chalk.gray('    $ node index.js perfil italorickes -n 20'));
  console.log(chalk.gray('    $ node index.js perfil gestao.impacto --tipo carrossel'));
  console.log(chalk.gray('    $ node index.js post https://www.instagram.com/p/ABC123/'));
  console.log(chalk.gray('    $ node index.js post https://www.instagram.com/p/ABC123/ --nome "meu-post"'));
  console.log(chalk.gray('    $ node index.js listar'));
  console.log(chalk.gray('    $ node index.js exportar'));
  console.log('');
}
