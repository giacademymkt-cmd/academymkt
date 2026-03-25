#!/bin/bash

# =====================================================
# Setup do Instagram Scraper - GI Academy
# =====================================================

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo -e "${CYAN}  ╔══════════════════════════════════════╗${NC}"
echo -e "${CYAN}  ║   Instagram Scraper — GI Academy     ║${NC}"
echo -e "${CYAN}  ╚══════════════════════════════════════╝${NC}"
echo ""

# Verificar Node.js
echo -e "${YELLOW}[1/3] Verificando Node.js...${NC}"
if ! command -v node &> /dev/null; then
  echo -e "${RED}  ✗ Node.js não encontrado.${NC}"
  echo -e "  Instale em: https://nodejs.org"
  exit 1
fi
echo -e "${GREEN}  ✓ Node.js $(node -v) encontrado${NC}"

# Instalar dependências
echo ""
echo -e "${YELLOW}[2/3] Instalando dependências...${NC}"
npm install --silent
if [ $? -ne 0 ]; then
  echo -e "${RED}  ✗ Erro ao instalar dependências${NC}"
  exit 1
fi
echo -e "${GREEN}  ✓ Dependências instaladas${NC}"

# Verificar Chrome/Chromium
echo ""
echo -e "${YELLOW}[3/3] Verificando Chrome/Chromium...${NC}"
CHROME_PATHS=(
  "/usr/bin/google-chrome"
  "/usr/bin/google-chrome-stable"
  "/usr/bin/chromium"
  "/usr/bin/chromium-browser"
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
  "/Applications/Chromium.app/Contents/MacOS/Chromium"
  "$HOME/.cache/ms-playwright/chromium-1194/chrome-linux/chrome"
)

FOUND_CHROME=""
for path in "${CHROME_PATHS[@]}"; do
  if [ -f "$path" ]; then
    FOUND_CHROME="$path"
    break
  fi
done

if [ -n "$FOUND_CHROME" ]; then
  echo -e "${GREEN}  ✓ Chrome encontrado: $FOUND_CHROME${NC}"
  echo ""
  echo -e "  ${CYAN}Dica:${NC} Se precisar, defina o caminho manualmente:"
  echo -e "  ${CYAN}export CHROME_PATH=\"$FOUND_CHROME\"${NC}"
else
  echo -e "${YELLOW}  ⚠ Chrome/Chromium não encontrado${NC}"
  echo -e "  O modo 'rapido' (sem login) funciona sem Chrome."
  echo -e "  Para usar com login, instale:"
  echo -e "  ${CYAN}• Mac:${NC}   brew install --cask google-chrome"
  echo -e "  ${CYAN}• Linux:${NC} sudo apt install chromium-browser"
  echo -e "  ${CYAN}• Win:${NC}   https://www.google.com/chrome"
fi

# Criar pasta de saída
mkdir -p output

echo ""
echo -e "${GREEN}  ✓ Setup concluído!${NC}"
echo ""
echo -e "  ${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "  ${CYAN}Como usar:${NC}"
echo ""
echo -e "  ${YELLOW}# Post público (sem login):${NC}"
echo -e "  node index.js rapido \"https://www.instagram.com/p/XXXXX/\""
echo ""
echo -e "  ${YELLOW}# Perfil público:${NC}"
echo -e "  node index.js rapido-perfil italorickes -n 10"
echo ""
echo -e "  ${YELLOW}# Com login (perfis privados):${NC}"
echo -e "  node index.js login -u seuusuario -p suasenha"
echo -e "  node index.js perfil gestao.impacto -n 30"
echo ""
echo -e "  ${YELLOW}# Ver tudo baixado:${NC}"
echo -e "  node index.js listar"
echo -e "  ${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
