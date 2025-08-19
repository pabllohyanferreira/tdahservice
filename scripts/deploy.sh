#!/bin/bash

# Script de Deploy Automatizado - TDAH Service
# Uso: ./scripts/deploy.sh [backend|frontend|all]

set -e

echo "🚀 Iniciando deploy do TDAH Service..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERRO] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[AVISO] $1${NC}"
}

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    error "Execute este script na raiz do projeto"
fi

# Função para deploy do backend
deploy_backend() {
    log "📦 Deployando backend..."
    
    cd backend
    
    # Verificar se .env existe
    if [ ! -f ".env" ]; then
        error "Arquivo .env não encontrado no backend"
    fi
    
    # Instalar dependências
    log "📥 Instalando dependências..."
    npm ci
    
    # Executar testes
    log "🧪 Executando testes..."
    npm test
    
    # Build do projeto
    log "🔨 Fazendo build..."
    npm run build
    
    # Deploy no Railway (se configurado)
    if command -v railway &> /dev/null; then
        log "🚂 Deployando no Railway..."
        railway up
    else
        warning "Railway CLI não encontrado. Deploy manual necessário."
    fi
    
    cd ..
    log "✅ Backend deployado com sucesso!"
}

# Função para deploy do frontend
deploy_frontend() {
    log "📱 Deployando frontend..."
    
    # Verificar se EAS CLI está instalado
    if ! command -v eas &> /dev/null; then
        error "EAS CLI não encontrado. Instale com: npm install -g @expo/eas-cli"
    fi
    
    # Verificar se está logado no Expo
    if ! eas whoami &> /dev/null; then
        error "Não está logado no Expo. Execute: eas login"
    fi
    
    # Build para produção
    log "🔨 Fazendo build para produção..."
    eas build --platform all --profile production --non-interactive
    
    # Deploy update
    log "📤 Publicando update..."
    eas update --branch production --message "Deploy automático - $(date)"
    
    log "✅ Frontend deployado com sucesso!"
}

# Função para deploy completo
deploy_all() {
    log "🌐 Deploy completo iniciado..."
    
    deploy_backend
    deploy_frontend
    
    log "🎉 Deploy completo finalizado!"
}

# Verificar argumentos
case "${1:-all}" in
    "backend")
        deploy_backend
        ;;
    "frontend")
        deploy_frontend
        ;;
    "all")
        deploy_all
        ;;
    *)
        error "Uso: $0 [backend|frontend|all]"
        ;;
esac

log "✨ Deploy finalizado com sucesso!" 