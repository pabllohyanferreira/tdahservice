#!/bin/bash

# 📱 Script de Build APK Externo - TDAH Service
# Este script gera um APK para instalação externa (sem Play Store)

set -e  # Parar em caso de erro

echo "📱 Gerando APK externo para TDAH Service..."

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

# Verificar se eas.json está configurado
log "Verificando configuração do eas.json..."
if [ ! -f "eas.json" ]; then
    error "eas.json não encontrado. Execute: eas build:configure"
fi

# Criar diretório para APKs se não existir
APK_DIR="./apks"
if [ ! -d "$APK_DIR" ]; then
    mkdir -p "$APK_DIR"
    log "Diretório de APKs criado: $APK_DIR"
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

# Build do APK
log "Iniciando build do APK..."
log "Isso pode levar 15-30 minutos..."

# Executar build
if eas build --platform android --profile apk-external; then
    log "✅ APK gerado com sucesso!"
    
    # Mover APK para diretório local se possível
    log "📁 APK disponível para download"
    log "🔗 Link do download será fornecido pelo Expo"
    
    echo ""
    echo "🎉 APK Externo Gerado!"
    echo ""
    echo "📱 Como instalar:"
    echo "1. Baixe o APK do link fornecido"
    echo "2. Transfira para seu dispositivo Android"
    echo "3. Habilite 'Fontes desconhecidas' nas configurações"
    echo "4. Toque no arquivo APK para instalar"
    echo ""
    echo "⚠️  IMPORTANTE:"
    echo "- Este APK é para instalação externa"
    echo "- Não será publicado na Play Store"
    echo "- Funciona em qualquer dispositivo Android"
    echo "- Não requer conta Google"
    echo ""
    echo "🔧 Configurações necessárias no Android:"
    echo "Configurações > Segurança > Fontes desconhecidas"
    
else
    error "❌ Build falhou. Verifique os logs acima."
fi

echo ""
log "🏁 Processo concluído!" 