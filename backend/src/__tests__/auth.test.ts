import request from 'supertest';
import app from '../app';
import mongoose from 'mongoose';
import User from '../models/User';

describe('Auth - Cadastro', () => {
  beforeAll(async () => {
    // Remove usuário de teste se existir
    await User.deleteOne({ email: 'testeuser@example.com' });
  });
  it('deve cadastrar um novo usuário com sucesso', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Teste User',
        email: 'testeuser@example.com',
        password: 'senha123'
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', 'testeuser@example.com');
  });
});

describe('Auth - Login', () => {
  it('deve fazer login com sucesso', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testeuser@example.com',
        password: 'senha123'
      });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', 'testeuser@example.com');
  });

  it('deve falhar login com senha errada', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testeuser@example.com',
        password: 'errada'
      });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

describe('Auth - Cadastro duplicado', () => {
  it('deve retornar erro ao tentar cadastrar e-mail já existente', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Outro User',
        email: 'testeuser@example.com',
        password: 'senha123'
      });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

describe('Auth - Reset de senha', () => {
  it('deve retornar erro se e-mail não existir', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'naoexiste@example.com' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

describe('Admin - Usuários', () => {
  let adminToken = '';
  let userId = '';
  beforeAll(async () => {
    // Cria admin
    await User.deleteOne({ email: 'admin@example.com' });
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Admin', email: 'admin@example.com', password: 'senha123' });
    await User.updateOne({ email: 'admin@example.com' }, { role: 'admin' });
    // Login admin
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'senha123' });
    adminToken = res.body.token;
    // Cria usuário comum
    await User.deleteOne({ email: 'comum@example.com' });
    const resUser = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Comum', email: 'comum@example.com', password: 'senha123' });
    userId = resUser.body.user.id;
  });
  it('deve listar usuários com paginação e filtro', async () => {
    const res = await request(app)
      .get('/api/admin/users?page=1&limit=2&email=comum')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('users');
    expect(Array.isArray(res.body.users)).toBe(true);
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('page', 1);
  });
  it('deve promover usuário para manager', async () => {
    const res = await request(app)
      .patch(`/api/admin/users/${userId}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'manager' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('role', 'manager');
  });
  it('deve deletar usuário', async () => {
    const res = await request(app)
      .delete(`/api/admin/users/${userId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });
}); 