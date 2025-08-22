const express = require('express');
const app = express();

app.use(express.json());

// Rota de teste simples
app.get('/test', (req, res) => {
  res.json({ message: 'Servidor de teste funcionando!' });
});

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rota de backup de teste
app.post('/backup/test', (req, res) => {
  const { deviceId } = req.headers;
  const data = req.body;
  
  console.log('Backup recebido:', { deviceId, data });
  
  res.json({ 
    success: true, 
    message: 'Backup de teste recebido',
    deviceId,
    dataReceived: !!data
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor de teste rodando na porta ${PORT}`);
  console.log(`📱 Teste disponível em: http://localhost:${PORT}/test`);
}); 