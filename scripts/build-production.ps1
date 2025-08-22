# 🚀 Script de Build de Produção - TDAH Service (Windows)
# Este script automatiza o processo de build para a Google Play Store

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

Write-Host "🚀 Iniciando build de produção para TDAH Service..." -ForegroundColor $Blue

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

# Verificar se app.json está configurado
Write-Log "Verificando configuração do app.json..."
$appJson = Get-Content "app.json" -Raw
if ($appJson -match "your-project-id") {
    Write-Warning "⚠️  Lembre-se de configurar o projectId no app.json"
}

if ($appJson -match "your-expo-username") {
    Write-Warning "⚠️  Lembre-se de configurar o owner no app.json"
}

# Verificar se eas.json está configurado
Write-Log "Verificando configuração do eas.json..."
if (-not (Test-Path "eas.json")) {
    Write-Error "eas.json não encontrado. Execute: eas build:configure"
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

# Build de produção
Write-Log "Iniciando build de produção..."
Write-Log "Isso pode levar 15-30 minutos..."

# Executar build
try {
    eas build --platform android --profile production
    
    Write-Log "✅ Build concluído com sucesso!"
    Write-Log "📱 Arquivo AAB disponível para upload na Play Store"
    
    Write-Host ""
    Write-Host "🎉 Próximos passos:" -ForegroundColor $Blue
    Write-Host "1. Acesse: https://play.google.com/console"
    Write-Host "2. Crie um novo app"
    Write-Host "3. Upload do arquivo AAB"
    Write-Host "4. Configure a listagem do app"
    Write-Host "5. Envie para revisão"
    Write-Host ""
    Write-Host "📚 Consulte o GUIA_PLAY_STORE.md para detalhes completos"
    
} catch {
    Write-Error "❌ Build falhou. Verifique os logs acima."
}

Write-Host ""
Write-Log "🏁 Processo concluído!" 