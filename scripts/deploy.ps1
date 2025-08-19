# Script de Deploy Automatizado - TDAH Service (PowerShell)
# Uso: .\scripts\deploy.ps1 [backend|frontend|all]

param(
    [Parameter(Position=0)]
    [ValidateSet("backend", "frontend", "all")]
    [string]$Target = "all"
)

# Configurar para parar em caso de erro
$ErrorActionPreference = "Stop"

Write-Host "🚀 Iniciando deploy do TDAH Service..." -ForegroundColor Green

# Função para log
function Write-Log {
    param([string]$Message)
    Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERRO] $Message" -ForegroundColor Red
    exit 1
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[AVISO] $Message" -ForegroundColor Yellow
}

# Verificar se está no diretório correto
if (-not (Test-Path "package.json")) {
    Write-Error "Execute este script na raiz do projeto"
}

# Função para deploy do backend
function Deploy-Backend {
    Write-Log "📦 Deployando backend..."
    
    Push-Location backend
    
    # Verificar se .env existe
    if (-not (Test-Path ".env")) {
        Write-Error "Arquivo .env não encontrado no backend"
    }
    
    # Instalar dependências
    Write-Log "📥 Instalando dependências..."
    npm ci
    
    # Executar testes
    Write-Log "🧪 Executando testes..."
    npm test
    
    # Build do projeto
    Write-Log "🔨 Fazendo build..."
    npm run build
    
    # Deploy no Railway (se configurado)
    try {
        $null = Get-Command railway -ErrorAction Stop
        Write-Log "🚂 Deployando no Railway..."
        railway up
    }
    catch {
        Write-Warning "Railway CLI não encontrado. Deploy manual necessário."
    }
    
    Pop-Location
    Write-Log "✅ Backend deployado com sucesso!"
}

# Função para deploy do frontend
function Deploy-Frontend {
    Write-Log "📱 Deployando frontend..."
    
    # Verificar se EAS CLI está instalado
    try {
        $null = Get-Command eas -ErrorAction Stop
    }
    catch {
        Write-Error "EAS CLI não encontrado. Instale com: npm install -g @expo/eas-cli"
    }
    
    # Verificar se está logado no Expo
    try {
        $null = eas whoami 2>$null
    }
    catch {
        Write-Error "Não está logado no Expo. Execute: eas login"
    }
    
    # Build para produção
    Write-Log "🔨 Fazendo build para produção..."
    eas build --platform all --profile production --non-interactive
    
    # Deploy update
    Write-Log "📤 Publicando update..."
    eas update --branch production --message "Deploy automático - $(Get-Date)"
    
    Write-Log "✅ Frontend deployado com sucesso!"
}

# Função para deploy completo
function Deploy-All {
    Write-Log "🌐 Deploy completo iniciado..."
    
    Deploy-Backend
    Deploy-Frontend
    
    Write-Log "🎉 Deploy completo finalizado!"
}

# Executar deploy baseado no parâmetro
switch ($Target) {
    "backend" { Deploy-Backend }
    "frontend" { Deploy-Frontend }
    "all" { Deploy-All }
}

Write-Log "✨ Deploy finalizado com sucesso!" 