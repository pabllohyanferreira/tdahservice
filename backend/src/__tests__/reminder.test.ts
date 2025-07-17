import request from 'supertest';
import app from '../app';
import User from '../models/User';

let token = '';
let reminderId = '';

describe('Lembretes - CRUD', () => {
  beforeAll(async () => {
    // Remove usuário de teste se existir
    await User.deleteOne({ email: 'testeuser@example.com' });
    // Cria usuário de teste
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Teste User', email: 'testeuser@example.com', password: 'senha123' });
    // Login para obter token
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'testeuser@example.com', password: 'senha123' });
    token = res.body.token;
  });

  it('deve criar um lembrete', async () => {
    const res = await request(app)
      .post('/api/reminders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Lembrete Teste',
        description: 'Descrição do lembrete',
        dateTime: new Date().toISOString(),
        priority: 'high',
        category: 'geral'
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id');
    reminderId = res.body._id;
  });

  it('deve listar lembretes', async () => {
    const res = await request(app)
      .get('/api/reminders')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.reminders)).toBe(true);
  });

  it('deve listar lembretes com paginação e filtro', async () => {
    // Cria lembretes extras
    await request(app)
      .post('/api/reminders')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Lembrete 2', description: '', dateTime: new Date().toISOString(), priority: 'low', category: 'trabalho' });
    await request(app)
      .post('/api/reminders')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Lembrete 3', description: '', dateTime: new Date().toISOString(), priority: 'medium', category: 'trabalho' });
    const res = await request(app)
      .get('/api/reminders?page=1&limit=2&priority=low&category=trabalho')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('reminders');
    expect(Array.isArray(res.body.reminders)).toBe(true);
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('page', 1);
  });

  it('deve atualizar um lembrete', async () => {
    const res = await request(app)
      .put(`/api/reminders/${reminderId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Lembrete Atualizado' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('title', 'Lembrete Atualizado');
  });

  it('deve deletar um lembrete', async () => {
    const res = await request(app)
      .delete(`/api/reminders/${reminderId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });
}); 