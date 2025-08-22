#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tdahservice';
const BACKUP_DIR = process.env.BACKUP_DIR || './backups';
const RETENTION_DAYS = process.env.BACKUP_RETENTION_DAYS || 7;

// Criar diretório de backup se não existir
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Função para executar backup
function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(BACKUP_DIR, `backup-${timestamp}.gz`);
  
  console.log(`🔄 Iniciando backup: ${backupFile}`);
  
  const command = `mongodump --uri="${MONGODB_URI}" --archive="${backupFile}" --gzip`;
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Erro no backup:', error);
      process.exit(1);
    }
    
    console.log('✅ Backup criado com sucesso:', backupFile);
    console.log('📊 Tamanho:', fs.statSync(backupFile).size, 'bytes');
    
    // Limpar backups antigos
    cleanupOldBackups();
  });
}

// Função para limpar backups antigos
function cleanupOldBackups() {
  const files = fs.readdirSync(BACKUP_DIR)
    .filter(file => file.startsWith('backup-'))
    .map(file => ({
      name: file,
      path: path.join(BACKUP_DIR, file),
      time: fs.statSync(path.join(BACKUP_DIR, file)).mtime
    }))
    .sort((a, b) => b.time - a.time);
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);
  
  const oldFiles = files.filter(file => file.time < cutoffDate);
  
  oldFiles.forEach(file => {
    fs.unlinkSync(file.path);
    console.log(`🗑️ Backup removido: ${file.name}`);
  });
  
  console.log(`🧹 Limpeza concluída. ${oldFiles.length} backups antigos removidos.`);
}

// Função para restaurar backup
function restoreBackup(backupFile) {
  if (!fs.existsSync(backupFile)) {
    console.error('❌ Arquivo de backup não encontrado:', backupFile);
    process.exit(1);
  }
  
  console.log(`🔄 Restaurando backup: ${backupFile}`);
  
  const command = `mongorestore --uri="${MONGODB_URI}" --archive="${backupFile}" --gzip`;
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Erro na restauração:', error);
      process.exit(1);
    }
    
    console.log('✅ Backup restaurado com sucesso!');
  });
}

// Função para listar backups
function listBackups() {
  const files = fs.readdirSync(BACKUP_DIR)
    .filter(file => file.startsWith('backup-'))
    .map(file => {
      const filePath = path.join(BACKUP_DIR, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        size: stats.size,
        date: stats.mtime
      };
    })
    .sort((a, b) => b.date - a.date);
  
  console.log('📋 Backups disponíveis:');
  files.forEach(file => {
    console.log(`   ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB) - ${file.date.toLocaleString()}`);
  });
}

// Executar comando baseado nos argumentos
const command = process.argv[2];

switch (command) {
  case 'create':
    createBackup();
    break;
  case 'restore':
    const backupFile = process.argv[3];
    if (!backupFile) {
      console.error('❌ Especifique o arquivo de backup para restaurar');
      process.exit(1);
    }
    restoreBackup(backupFile);
    break;
  case 'list':
    listBackups();
    break;
  case 'cleanup':
    cleanupOldBackups();
    break;
  default:
    console.log('📚 Uso do script de backup:');
    console.log('   node backup.js create     - Criar novo backup');
    console.log('   node backup.js restore <file> - Restaurar backup');
    console.log('   node backup.js list       - Listar backups');
    console.log('   node backup.js cleanup    - Limpar backups antigos');
    break;
} 