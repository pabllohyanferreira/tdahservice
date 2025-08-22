#!/bin/bash

# 🚀 Script de Build de Produção - TDAH Service
# Este script automatiza o processo de build para a Google Play Store

set -e  # Parar em caso de erro

echo "🚀 Iniciando build de produção para TDAH Service..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[AVISO] $1${NC}"
}

error() {
    echo -e "${RED}[ERRO] $1${NC}"
    exit 1
}

# Verificar se EAS CLI está instalado
if ! command -v eas &> /dev/null; then
    error "EAS CLI não está instalado. Execute: npm install -g @expo/eas-cli"
fi

# Verificar se está logado no Expo
log "Verificando login no Expo..."
if ! eas whoami &> /dev/null; then
    error "Você não está logado no Expo. Execute: eas login"
fi

# Verificar se está no diretório correto
if [ ! -f "app.json" ]; then
    error "Execute este script no diretório raiz do projeto"
fi

# Verificar se app.json está configurado
log "Verificando configuração do app.json..."
if grep -q "your-project-id" app.json; then
    warn "⚠️  Lembre-se de configurar o projectId no app.json"
fi

if grep -q "your-expo-username" app.json; then
    warn "⚠️  Lembre-se de configurar o owner no app.json"
fi

# Verificar se eas.json está configurado
log "Verificando configuração do eas.json..."
if [ ! -f "eas.json" ]; then
    error "eas.json não encontrado. Execute: eas build:configure"
fi

# Limpar cache se necessário
if [ "$1" = "--clean" ]; then
    log "Limpando cache..."
    rm -rf node_modules
    npm install
fi

# Verificar dependências
log "Verificando dependências..."
npm audit --audit-level moderate || warn "Algumas vulnerabilidades encontradas"

# Build de produção
log "Iniciando build de produção..."
log "Isso pode levar 15-30 minutos..."

# Executar build
if eas build --platform android --profile production; then
    log "✅ Build concluído com sucesso!"
    log "📱 Arquivo AAB disponível para upload na Play Store"
    
    echo ""
    echo "🎉 Próximos passos:"
    echo "1. Acesse: https://play.google.com/console"
    echo "2. Crie um novo app"
    echo "3. Upload do arquivo AAB"
    echo "4. Configure a listagem do app"
    echo "5. Envie para revisão"
    echo ""
    echo "📚 Consulte o GUIA_PLAY_STORE.md para detalhes completos"
    
else
    error "❌ Build falhou. Verifique os logs acima."
fi

echo ""
log "🏁 Processo concluído!" 