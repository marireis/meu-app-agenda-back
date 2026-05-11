import request from 'supertest';
import app from '../server.js'; // Certifique-se de exportar o 'app' no server.js

describe('Testes de Integração - Empresa', () => {
  it('Deve criar uma nova empresa com sucesso', async () => {
    const res = await request(app)
      .post('/api/empresas')
      .send({
        nome: "Salão Teste",
        slug: "salao-teste-" + Date.now(), // Slug único para cada teste
        corPrincipal: "#000000"
      });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
  });

  it('Deve retornar 404 para empresa inexistente', async () => {
    const res = await request(app).get('/api/config/slug-que-nao-existe');
    expect(res.statusCode).toEqual(404);
  });
});