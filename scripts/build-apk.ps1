# 📱 Script de Build APK Externo - TDAH Service (Windows)
# Este script gera um APK para instalação externa (sem Play Store)

param(
    [switch]$Clean
)

# Configurar cores para output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"

# Função para log colorido
function Write-Log {
    param([string]$Message, [string]$Color = $Green)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] $Message" -ForegroundColor $Color
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[AVISO] $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERRO] $Message" -ForegroundColor $Red
    exit 1
}

Write-Host "📱 Gerando APK externo para TDAH Service..." -ForegroundColor $Blue

# Verificar se EAS CLI está instalado
Write-Log "Verificando EAS CLI..."
try {
    $null = Get-Command eas -ErrorAction Stop
} catch {
    Write-Error "EAS CLI não está instalado. Execute: npm install -g @expo/eas-cli"
}

# Verificar se está logado no Expo
Write-Log "Verificando login no Expo..."
try {
    $null = eas whoami 2>$null
} catch {
    Write-Error "Você não está logado no Expo. Execute: eas login"
}

# Verificar se está no diretório correto
if (-not (Test-Path "app.json")) {
    Write-Error "Execute este script no diretório raiz do projeto"
}

# Verificar se eas.json está configurado
Write-Log "Verificando configuração do eas.json..."
if (-not (Test-Path "eas.json")) {
    Write-Error "eas.json não encontrado. Execute: eas build:configure"
}

# Criar diretório para APKs se não existir
$APK_DIR = ".\apks"
if (-not (Test-Path $APK_DIR)) {
    New-Item -ItemType Directory -Path $APK_DIR -Force
    Write-Log "Diretório de APKs criado: $APK_DIR"
}

# Limpar cache se necessário
if ($Clean) {
    Write-Log "Limpando cache..."
    if (Test-Path "node_modules") {
        Remove-Item -Recurse -Force "node_modules"
    }
    npm install
}

# Verificar dependências
Write-Log "Verificando dependências..."
try {
    npm audit --audit-level moderate
} catch {
    Write-Warning "Algumas vulnerabilidades encontradas"
}

# Build do APK
Write-Log "Iniciando build do APK..."
Write-Log "Isso pode levar 15-30 minutos..."

# Executar build
try {
    eas build --platform android --profile apk-external
    
    Write-Log "✅ APK gerado com sucesso!"
    Write-Log "📁 APK disponível para download"
    Write-Log "🔗 Link do download será fornecido pelo Expo"
    
    Write-Host ""
    Write-Host "🎉 APK Externo Gerado!" -ForegroundColor $Blue
    Write-Host ""
    Write-Host "📱 Como instalar:"
    Write-Host "1. Baixe o APK do link fornecido"
    Write-Host "2. Transfira para seu dispositivo Android"
    Write-Host "3. Habilite 'Fontes desconhecidas' nas configurações"
    Write-Host "4. Toque no arquivo APK para instalar"
    Write-Host ""
    Write-Host "⚠️  IMPORTANTE:"
    Write-Host "- Este APK é para instalação externa"
    Write-Host "- Não será publicado na Play Store"
    Write-Host "- Funciona em qualquer dispositivo Android"
    Write-Host "- Não requer conta Google"
    Write-Host ""
    Write-Host "🔧 Configurações necessárias no Android:"
    Write-Host "Configuracoes > Seguranca > Fontes desconhecidas"
    
} catch {
    Write-Error "❌ Build falhou. Verifique os logs acima."
}

Write-Host ""
Write-Log "Processo concluido!" 