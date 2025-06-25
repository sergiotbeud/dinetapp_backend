import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DinettApp POS API',
      version: '1.0.0',
      description: 'API para sistema de Punto de Venta con soporte multitenant',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
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
  apis: ['./src/interfaces/http/routes/*.ts', './src/infrastructure/web/controllers/*.ts'],
};

export const specs = swaggerJsdoc(options); 