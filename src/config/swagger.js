import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API AgendeOnline SaaS',
      version: '1.0.0',
      description: 'Documentação oficial da API do sistema de agendamento multi-tenant.',
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Servidor Local (Desenvolvimento)',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/docs/swaggerDocs.js'],
};

export const swaggerSpec = swaggerJsdoc(options);