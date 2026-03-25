# Skill: Instagram Scraper — Banco de Dados Visual

## Quando usar esta skill

Use esta skill sempre que o usuário pedir para:
- Baixar imagens de um post do Instagram
- Fazer scraping de um perfil do Instagram
- Construir ou atualizar o banco de dados visual de conteúdo
- Buscar referências de carrosséis ou posts estáticos de um perfil
- Alimentar o agente designer com novos conteúdos visuais

## Localização da ferramenta

O scraper está em:
```
tools/instagram-scraper/
```

Execute sempre a partir dessa pasta:
```bash
cd tools/instagram-scraper
```

---

## Comandos disponíveis

### 1. Scraping de post individual (sem login)
Para posts públicos, tente primeiro sem login:
```bash
node index.js rapido "<URL_DO_POST>"
```

Exemplo:
```bash
node index.js rapido "https://www.instagram.com/p/DWTbbKnle-8/"
```

### 2. Scraping de perfil completo (sem login)
```bash
node index.js rapido-perfil <username> -n <quantidade>
```

Exemplo — pegar os 15 posts mais recentes de um perfil:
```bash
node index.js rapido-perfil italorickes -n 15
```

### 3. Login (necessário para perfis privados)
Se o scraping sem login falhar, faça login primeiro:
```bash
node index.js login -u <usuario_instagram> -p <senha_instagram>
```

### 4. Scraping com login (pós autenticação)
```bash
# Post individual:
node index.js post "<URL_DO_POST>"

# Perfil completo:
node index.js perfil <username> -n 30

# Filtrar só carrosséis:
node index.js perfil <username> --tipo carrossel
```

### 5. Listar conteúdo já baixado
```bash
node index.js listar
```

### 6. Exportar índice JSON para o agente designer
```bash
node index.js exportar
```
Gera `output/indice-visual.json` com todos os posts, captions e caminhos de imagens.

---

## Estrutura de saída

Cada post é salvo em:
```
tools/instagram-scraper/output/
└── <perfil>/
    ├── carrossel_<nome-gerado-do-caption>/
    │   ├── slide_01.jpg
    │   ├── slide_02.jpg
    │   ├── slide_03.jpg
    │   └── metadata.json
    ├── post-estatico_<nome>/
    │   ├── imagem.jpg
    │   └── metadata.json
    └── relatorio.json
```

O nome da pasta é gerado automaticamente a partir do caption do post.

---

## Como passar o conteúdo para o agente designer

Após o scraping, use o comando exportar para gerar o índice:
```bash
node index.js exportar
```

O arquivo `output/indice-visual.json` contém:
- URL original de cada post
- Tipo (carrossel, post-estático, vídeo)
- Caption completo
- Caminhos locais de todas as imagens
- Perfil e timestamp

Passe esse arquivo ou os caminhos das imagens diretamente para o agente designer como referência visual.

---

## Regras de comportamento

1. **Tente sempre sem login primeiro** (`rapido` ou `rapido-perfil`)
2. Se retornar 403 ou "Instagram bloqueando IP", informe o usuário e sugira rodar localmente
3. **Nunca peça ou armazene credenciais do Instagram** no código ou em arquivos commitados
4. O arquivo `cookies.json` é gerado localmente e já está no `.gitignore`
5. Após o scraping, sempre rode `listar` para confirmar o que foi baixado
6. Se o usuário quiser alimentar o agente designer, rode `exportar` e mostre o caminho do `indice-visual.json`

---

## Solução de problemas

| Problema | Causa | Solução |
|---|---|---|
| `Instagram bloqueando IP` | Ambiente cloud/servidor | Rodar localmente no computador |
| `Sessao nao encontrada` | Sem login | Rodar `login` primeiro |
| `Nenhuma imagem encontrada` | Post privado | Fazer login com conta que segue o perfil |
| `Chrome nao encontrado` | Chromium não instalado | `sudo apt install chromium-browser` ou definir `CHROME_PATH` |
| `0 posts encontrados` | Perfil privado | Fazer login com conta autorizada |
