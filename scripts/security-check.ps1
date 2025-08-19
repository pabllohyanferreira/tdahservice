# Script de Verificacao de Seguranca - TDAH Service
# Execute este script antes de fazer push para o GitHub

Write-Host "VERIFICACAO DE SEGURANCA - TDAH Service" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

$hasErrors = $false

# 1. Verificar se ha arquivos .env
Write-Host "`n1. Verificando arquivos .env..." -ForegroundColor Yellow
$envFiles = Get-ChildItem -Recurse -Name "*.env" -ErrorAction SilentlyContinue
if ($envFiles) {
    Write-Host "ERRO: ARQUIVOS .ENV ENCONTRADOS!" -ForegroundColor Red
    $envFiles | ForEach-Object { Write-Host "   - $_" -ForegroundColor Red }
    $hasErrors = $true
} else {
    Write-Host "OK: Nenhum arquivo .env encontrado" -ForegroundColor Green
}

# 2. Verificar se ha logs sensiveis
Write-Host "`n2. Verificando arquivos de log..." -ForegroundColor Yellow
$logFiles = Get-ChildItem -Recurse -Name "*.log" -ErrorAction SilentlyContinue
if ($logFiles) {
    Write-Host "ATENCAO: Arquivos de log encontrados (serao ignorados pelo .gitignore):" -ForegroundColor Yellow
    $logFiles | ForEach-Object { Write-Host "   - $_" -ForegroundColor Yellow }
} else {
    Write-Host "OK: Nenhum arquivo de log encontrado" -ForegroundColor Green
}

# 3. Verificar se ha chaves sensiveis no codigo
Write-Host "`n3. Verificando chaves sensiveis no codigo..." -ForegroundColor Yellow
$sensitivePatterns = @(
    "mongodb\+srv://",
    "mongodb://.*:.*@",
    "sk-",
    "pk_",
    "AKIA",
    "AIza",
    "ya29\.",
    "1//",
    "password.*=.*[^=]",
    "secret.*=.*[^=]",
    "key.*=.*[^=]",
    "token.*=.*[^=]"
)

$sensitiveFiles = @()
foreach ($pattern in $sensitivePatterns) {
    $files = Get-ChildItem -Recurse -Include "*.ts", "*.tsx", "*.js", "*.jsx", "*.json" | 
             Select-String -Pattern $pattern -List | 
             Select-Object -ExpandProperty Filename
    $sensitiveFiles += $files
}

if ($sensitiveFiles) {
    Write-Host "ERRO: POSSIVEIS CHAVES SENSIVEIS ENCONTRADAS!" -ForegroundColor Red
    $sensitiveFiles | Sort-Object -Unique | ForEach-Object { 
        Write-Host "   - $_" -ForegroundColor Red 
    }
    $hasErrors = $true
} else {
    Write-Host "OK: Nenhuma chave sensivel encontrada no codigo" -ForegroundColor Green
}

# 4. Verificar arquivos que serao commitados
Write-Host "`n4. Verificando arquivos para commit..." -ForegroundColor Yellow
$stagedFiles = git diff --cached --name-only 2>$null
if ($stagedFiles) {
    Write-Host "Arquivos que serao commitados:" -ForegroundColor Cyan
    $stagedFiles | ForEach-Object { Write-Host "   + $_" -ForegroundColor Cyan }
} else {
    Write-Host "Nenhum arquivo esta staged para commit" -ForegroundColor Yellow
}

# 5. Verificar se .gitignore esta funcionando
Write-Host "`n5. Verificando .gitignore..." -ForegroundColor Yellow
$gitignoreTest = git check-ignore backend/logs/*.log 2>$null
if ($gitignoreTest) {
    Write-Host "OK: .gitignore esta funcionando corretamente" -ForegroundColor Green
} else {
    Write-Host "ATENCAO: Verificar se .gitignore esta configurado" -ForegroundColor Yellow
}

# Resultado final
Write-Host "`n================================================" -ForegroundColor Green
if ($hasErrors) {
    Write-Host "VERIFICACAO FALHOU!" -ForegroundColor Red
    Write-Host "Corrija os problemas acima antes de fazer push." -ForegroundColor Red
    exit 1
} else {
    Write-Host "VERIFICACAO APROVADA!" -ForegroundColor Green
    Write-Host "Seu projeto esta seguro para push no GitHub." -ForegroundColor Green
}

Write-Host "`nProximos passos:" -ForegroundColor Cyan
Write-Host "1. git add ." -ForegroundColor White
Write-Host "2. git commit -m feat: implementacao segura" -ForegroundColor White
Write-Host "3. git push" -ForegroundColor White 