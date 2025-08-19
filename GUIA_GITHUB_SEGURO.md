# 🔒 Guia Completo: Como Subir seu Código para o GitHub com Segurança

## 📋 Pré-requisitos

### 1. **Conta no GitHub**
- Crie uma conta em [github.com](https://github.com)
- Configure autenticação de dois fatores (2FA)

### 2. **Git Instalado**
```bash
# Verificar se Git está instalado
git --version

# Se não estiver, baixe em: https://git-scm.com/
```

## 🛡️ Verificação de Segurança (OBRIGATÓRIO)

### 1. **Verificar Arquivos Sensíveis**
```bash
# Execute o script de verificação de segurança
./scripts/security-check.ps1

# Ou verifique manualmente:
# 1. Não deve haver arquivos .env
# 2. Não deve haver chaves reais no código
# 3. Verificar se .gitignore está correto
```

### 2. **Verificar .gitignore**
Seu projeto já tem um `.gitignore` excelente que protege:
- ✅ Arquivos `.env` e variáveis de ambiente
- ✅ `node_modules/`
- ✅ Logs e arquivos temporários
- ✅ Chaves e certificados
- ✅ Arquivos de build

## 🚀 Passo a Passo para Subir no GitHub

### **Passo 1: Inicializar Repositório Git (se ainda não feito)**
```bash
# Navegar para a pasta do projeto
cd /c/Users/Admin/tdahservice

# Inicializar Git (se ainda não foi feito)
git init

# Verificar status
git status
```

### **Passo 2: Adicionar Arquivos de Forma Segura**
```bash
# Adicionar todos os arquivos (exceto os protegidos pelo .gitignore)
git add .

# Verificar o que será commitado
git status

# Verificar se não há arquivos sensíveis sendo commitados
git diff --cached | grep -i "password\|secret\|key\|token\|\.env"
```

### **Passo 3: Fazer o Primeiro Commit**
```bash
# Commit inicial
git commit -m "feat: implementação inicial do TDAH Service

- App React Native com autenticação Google
- Backend Node.js com MongoDB
- Sistema de lembretes e notificações
- Interface adaptativa para TDAH
- Configuração segura sem dados sensíveis"
```

### **Passo 4: Criar Repositório no GitHub**

1. **Acesse [github.com](https://github.com)**
2. **Clique em "New repository"**
3. **Configure o repositório:**
   - **Repository name:** `tdahservice`
   - **Description:** `Aplicativo de gerenciamento de lembretes e tarefas para pessoas com TDAH`
   - **Visibility:** `Public` (ou `Private` se preferir)
   - **NÃO marque:** "Add a README file" (já temos um)
   - **NÃO marque:** "Add .gitignore" (já temos um)

4. **Clique em "Create repository"**

### **Passo 5: Conectar Repositório Local ao GitHub**
```bash
# Adicionar o repositório remoto (substitua SEU_USUARIO pelo seu username)
git remote add origin https://github.com/SEU_USUARIO/tdahservice.git

# Verificar se foi adicionado
git remote -v
```

### **Passo 6: Fazer Push para o GitHub**
```bash
# Primeiro push (definir upstream)
git push -u origin main

# Se der erro de branch, use:
git branch -M main
git push -u origin main
```

## 🔐 Configurações de Segurança Adicionais

### **1. Configurar GitHub Secrets (para CI/CD)**
Se você planeja usar GitHub Actions:

1. **Vá para Settings > Secrets and variables > Actions**
2. **Adicione secrets:**
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`

### **2. Configurar Branch Protection**
1. **Vá para Settings > Branches**
2. **Add rule para `main`**
3. **Marque:**
   - ✅ "Require a pull request before merging"
   - ✅ "Require status checks to pass before merging"
   - ✅ "Include administrators"

### **3. Configurar Dependabot**
1. **Vá para Settings > Code security and analysis**
2. **Enable:**
   - ✅ Dependabot alerts
   - ✅ Dependabot security updates
   - ✅ Code scanning

## 📝 README.md Atualizado

Seu README.md já está bem estruturado, mas certifique-se de que inclui:

- ✅ Descrição do projeto
- ✅ Instruções de instalação
- ✅ Configuração de ambiente
- ✅ Como executar
- ✅ Tecnologias utilizadas
- ✅ Contribuição

## 🚨 Checklist Final Antes do Push

### **Verificações Obrigatórias:**
- [ ] ✅ Nenhum arquivo `.env` no repositório
- [ ] ✅ Nenhuma chave real no código
- [ ] ✅ `.gitignore` configurado corretamente
- [ ] ✅ README.md atualizado
- [ ] ✅ Código testado e funcionando
- [ ] ✅ Script de segurança executado sem erros

### **Comandos de Verificação:**
```bash
# Verificar arquivos que serão commitados
git status

# Verificar se não há dados sensíveis
git diff --cached | grep -i "password\|secret\|key\|token"

# Verificar se .env está sendo ignorado
git check-ignore .env

# Se tudo estiver OK, fazer push
git push origin main
```

## 🔍 Monitoramento Pós-Deploy

### **1. Verificar se tudo foi enviado corretamente**
- Acesse seu repositório no GitHub
- Verifique se todos os arquivos estão lá
- Confirme que não há arquivos sensíveis

### **2. Configurar Issues e Projects**
- Crie labels para organização
- Configure templates para issues
- Crie um project board se necessário

### **3. Configurar Deploy Automático (Opcional)**
- Railway para backend
- Vercel para frontend
- GitHub Actions para CI/CD

## 🆘 Solução de Problemas Comuns

### **Erro: "fatal: remote origin already exists"**
```bash
# Remover e adicionar novamente
git remote remove origin
git remote add origin https://github.com/SEU_USUARIO/tdahservice.git
```

### **Erro: "Permission denied"**
```bash
# Configurar credenciais
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@exemplo.com"
```

### **Erro: "Large file detected"**
```bash
# Verificar arquivos grandes
git ls-files | xargs ls -la | sort -k5 -nr | head -10

# Remover arquivos grandes se necessário
git rm --cached ARQUIVO_GRANDE
```

## ✅ Status Final

Após seguir todos os passos, seu código estará:
- 🔒 **Seguro** - Sem dados sensíveis expostos
- 📚 **Documentado** - README completo
- 🛡️ **Protegido** - Configurações de segurança ativas
- 🚀 **Pronto para deploy** - Configuração de produção

## 📞 Suporte

Se encontrar problemas:
1. Verifique a documentação do GitHub
2. Consulte o `SECURITY_CHECKLIST.md` do projeto
3. Execute novamente o script de verificação de segurança

---

**🎉 Parabéns! Seu projeto está seguro e pronto para o GitHub!** 