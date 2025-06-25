import request from 'supertest';
import express from 'express';
import userRoutes from '../../src/interfaces/http/routes/user.routes';
import { DatabaseConnection } from '../../src/infrastructure/db/mysql/DatabaseConnection';

const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

describe('User API Integration Tests', () => {
  let dbConnection: DatabaseConnection;

  beforeAll(async () => {
    dbConnection = new DatabaseConnection();
    // Limpiar base de datos de prueba
    await dbConnection.execute('DELETE FROM users WHERE tenant_id = ?', ['test-tenant']);
  });

  afterAll(async () => {
    await dbConnection.close();
  });

  afterEach(async () => {
    // Limpiar después de cada prueba
    await dbConnection.execute('DELETE FROM users WHERE tenant_id = ?', ['test-tenant']);
  });

  describe('POST /api/users', () => {
    const validUserData = {
      id: 'test-user-1',
      name: 'Test User',
      nickname: 'testuser',
      phone: '+1234567890',
      email: 'test@example.com',
      role: 'cashier'
    };

    it('should create a user successfully', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', 'Bearer mock-token')
        .set('X-Tenant-ID', 'test-tenant')
        .send(validUserData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User created successfully');
      expect(response.body.data).toMatchObject({
        id: validUserData.id,
        name: validUserData.name,
        nickname: validUserData.nickname,
        phone: validUserData.phone,
        email: validUserData.email,
        role: validUserData.role,
        active: true,
        tenantId: 'test-tenant'
      });
      expect(response.body.data.createdAt).toBeDefined();
    });

    it('should return 400 when required fields are missing', async () => {
      const invalidUserData = {
        id: 'test-user-2',
        name: 'Test User',
        // nickname missing
        phone: '+1234567890',
        email: 'test2@example.com',
        role: 'cashier'
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', 'Bearer mock-token')
        .set('X-Tenant-ID', 'test-tenant')
        .send(invalidUserData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation Error');
      expect(response.body.message).toContain('nickname');
    });

    it('should return 409 when email already exists', async () => {
      // Crear primer usuario
      await request(app)
        .post('/api/users')
        .set('Authorization', 'Bearer mock-token')
        .set('X-Tenant-ID', 'test-tenant')
        .send(validUserData)
        .expect(201);

      // Intentar crear segundo usuario con mismo email
      const duplicateUserData = {
        ...validUserData,
        id: 'test-user-3'
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', 'Bearer mock-token')
        .set('X-Tenant-ID', 'test-tenant')
        .send(duplicateUserData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Duplicate Error');
      expect(response.body.message).toContain('already exists');
    });

    it('should return 409 when ID already exists', async () => {
      // Crear primer usuario
      await request(app)
        .post('/api/users')
        .set('Authorization', 'Bearer mock-token')
        .set('X-Tenant-ID', 'test-tenant')
        .send(validUserData)
        .expect(201);

      // Intentar crear segundo usuario con mismo ID
      const duplicateUserData = {
        ...validUserData,
        email: 'different@example.com'
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', 'Bearer mock-token')
        .set('X-Tenant-ID', 'test-tenant')
        .send(duplicateUserData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Duplicate Error');
      expect(response.body.message).toContain('already exists');
    });

    it('should return 401 when authorization is missing', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('X-Tenant-ID', 'test-tenant')
        .send(validUserData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Unauthorized');
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return user when found', async () => {
      const userData = {
        id: 'test-user-4',
        name: 'Test User',
        nickname: 'testuser4',
        phone: '+1234567890',
        email: 'test4@example.com',
        role: 'cashier'
      };

      // Crear usuario
      await request(app)
        .post('/api/users')
        .set('Authorization', 'Bearer mock-token')
        .set('X-Tenant-ID', 'test-tenant')
        .send(userData)
        .expect(201);

      // Obtener usuario
      const response = await request(app)
        .get(`/api/users/${userData.id}`)
        .set('Authorization', 'Bearer mock-token')
        .set('X-Tenant-ID', 'test-tenant')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role
      });
    });

    it('should return 404 when user not found', async () => {
      const response = await request(app)
        .get('/api/users/non-existent-id')
        .set('Authorization', 'Bearer mock-token')
        .set('X-Tenant-ID', 'test-tenant')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('User Not Found');
    });
  });
}); 