import request from 'supertest';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import userRoutes from '../../src/interfaces/http/routes/user.routes';
import { DatabaseConnection } from '../../src/infrastructure/db/mysql/DatabaseConnection';

// Create test app
const app = express();

// Middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too Many Requests',
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// Middleware para parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/users', userRoutes);

describe('Search Users API', () => {
  let dbConnection: DatabaseConnection;

  beforeAll(async () => {
    dbConnection = new DatabaseConnection();
    await dbConnection.testConnection();
  });

  afterAll(async () => {
    await dbConnection.close();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await dbConnection.execute('DELETE FROM users WHERE tenant_id IN (?, ?)', ['tenant1', 'tenant2']);
  });

  describe('GET /api/users', () => {
    it('should search users by name successfully', async () => {
      // Create test users
      const user1 = {
        id: 'user1',
        name: 'John Doe',
        nickname: 'johndoe',
        phone: '123456789',
        email: 'john@example.com',
        role: 'admin',
        tenant_id: 'tenant1'
      };

      const user2 = {
        id: 'user2',
        name: 'Jane Smith',
        nickname: 'janesmith',
        phone: '987654321',
        email: 'jane@example.com',
        role: 'user',
        tenant_id: 'tenant1'
      };

      await dbConnection.execute(
        'INSERT INTO users (id, name, nickname, phone, email, role, tenant_id, created_at, active) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), true)',
        [user1.id, user1.name, user1.nickname, user1.phone, user1.email, user1.role, user1.tenant_id]
      );

      await dbConnection.execute(
        'INSERT INTO users (id, name, nickname, phone, email, role, tenant_id, created_at, active) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), true)',
        [user2.id, user2.name, user2.nickname, user2.phone, user2.email, user2.role, user2.tenant_id]
      );

      const response = await request(app)
        .get('/api/users')
        .query({ name: 'John' })
        .set('Authorization', 'Bearer mock-token')
        .set('x-tenant-id', 'tenant1')
        .set('x-user-permissions', 'user.read')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.users).toHaveLength(1);
      expect(response.body.data.users[0].name).toBe('John Doe');
      expect(response.body.data.total).toBe(1);
    });

    it('should search users by role successfully', async () => {
      // Create test users
      const user1 = {
        id: 'user1',
        name: 'John Doe',
        nickname: 'johndoe',
        phone: '123456789',
        email: 'john@example.com',
        role: 'admin',
        tenant_id: 'tenant1'
      };

      const user2 = {
        id: 'user2',
        name: 'Jane Smith',
        nickname: 'janesmith',
        phone: '987654321',
        email: 'jane@example.com',
        role: 'user',
        tenant_id: 'tenant1'
      };

      await dbConnection.execute(
        'INSERT INTO users (id, name, nickname, phone, email, role, tenant_id, created_at, active) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), true)',
        [user1.id, user1.name, user1.nickname, user1.phone, user1.email, user1.role, user1.tenant_id]
      );

      await dbConnection.execute(
        'INSERT INTO users (id, name, nickname, phone, email, role, tenant_id, created_at, active) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), true)',
        [user2.id, user2.name, user2.nickname, user2.phone, user2.email, user2.role, user2.tenant_id]
      );

      const response = await request(app)
        .get('/api/users')
        .query({ role: 'admin' })
        .set('Authorization', 'Bearer mock-token')
        .set('x-tenant-id', 'tenant1')
        .set('x-user-permissions', 'user.read')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.users).toHaveLength(1);
      expect(response.body.data.users[0].role).toBe('admin');
      expect(response.body.data.total).toBe(1);
    });

    it('should search users by email successfully', async () => {
      // Create test user
      const user = {
        id: 'user1',
        name: 'John Doe',
        nickname: 'johndoe',
        phone: '123456789',
        email: 'john@example.com',
        role: 'admin',
        tenant_id: 'tenant1'
      };

      await dbConnection.execute(
        'INSERT INTO users (id, name, nickname, phone, email, role, tenant_id, created_at, active) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), true)',
        [user.id, user.name, user.nickname, user.phone, user.email, user.role, user.tenant_id]
      );

      const response = await request(app)
        .get('/api/users')
        .query({ email: 'john@example.com' })
        .set('Authorization', 'Bearer mock-token')
        .set('x-tenant-id', 'tenant1')
        .set('x-user-permissions', 'user.read')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.users).toHaveLength(1);
      expect(response.body.data.users[0].email).toBe('john@example.com');
      expect(response.body.data.total).toBe(1);
    });

    it('should search users by ID successfully', async () => {
      // Create test user
      const user = {
        id: 'user1',
        name: 'John Doe',
        nickname: 'johndoe',
        phone: '123456789',
        email: 'john@example.com',
        role: 'admin',
        tenant_id: 'tenant1'
      };

      await dbConnection.execute(
        'INSERT INTO users (id, name, nickname, phone, email, role, tenant_id, created_at, active) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), true)',
        [user.id, user.name, user.nickname, user.phone, user.email, user.role, user.tenant_id]
      );

      const response = await request(app)
        .get('/api/users')
        .query({ id: 'user1' })
        .set('Authorization', 'Bearer mock-token')
        .set('x-tenant-id', 'tenant1')
        .set('x-user-permissions', 'user.read')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.users).toHaveLength(1);
      expect(response.body.data.users[0].id).toBe('user1');
      expect(response.body.data.total).toBe(1);
    });

    it('should search users with combined filters', async () => {
      // Create test users
      const user1 = {
        id: 'user1',
        name: 'John Doe',
        nickname: 'johndoe',
        phone: '123456789',
        email: 'john@example.com',
        role: 'admin',
        tenant_id: 'tenant1'
      };

      const user2 = {
        id: 'user2',
        name: 'John Smith',
        nickname: 'johnsmith',
        phone: '987654321',
        email: 'johnsmith@example.com',
        role: 'user',
        tenant_id: 'tenant1'
      };

      await dbConnection.execute(
        'INSERT INTO users (id, name, nickname, phone, email, role, tenant_id, created_at, active) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), true)',
        [user1.id, user1.name, user1.nickname, user1.phone, user1.email, user1.role, user1.tenant_id]
      );

      await dbConnection.execute(
        'INSERT INTO users (id, name, nickname, phone, email, role, tenant_id, created_at, active) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), true)',
        [user2.id, user2.name, user2.nickname, user2.phone, user2.email, user2.role, user2.tenant_id]
      );

      const response = await request(app)
        .get('/api/users')
        .query({ name: 'John', role: 'admin' })
        .set('Authorization', 'Bearer mock-token')
        .set('x-tenant-id', 'tenant1')
        .set('x-user-permissions', 'user.read')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.users).toHaveLength(1);
      expect(response.body.data.users[0].name).toBe('John Doe');
      expect(response.body.data.users[0].role).toBe('admin');
      expect(response.body.data.total).toBe(1);
    });

    it('should return empty results when no users match', async () => {
      const response = await request(app)
        .get('/api/users')
        .query({ name: 'NonExistent' })
        .set('Authorization', 'Bearer mock-token')
        .set('x-tenant-id', 'tenant1')
        .set('x-user-permissions', 'user.read')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('No users found');
      expect(response.body.data.users).toHaveLength(0);
      expect(response.body.data.total).toBe(0);
    });

    it('should respect tenant isolation', async () => {
      // Create users in different tenants
      const user1 = {
        id: 'user1',
        name: 'John Doe',
        nickname: 'johndoe',
        phone: '123456789',
        email: 'john@example.com',
        role: 'admin',
        tenant_id: 'tenant1'
      };

      const user2 = {
        id: 'user2',
        name: 'Jane Smith',
        nickname: 'janesmith',
        phone: '987654321',
        email: 'jane@example.com',
        role: 'admin',
        tenant_id: 'tenant2'
      };

      await dbConnection.execute(
        'INSERT INTO users (id, name, nickname, phone, email, role, tenant_id, created_at, active) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), true)',
        [user1.id, user1.name, user1.nickname, user1.phone, user1.email, user1.role, user1.tenant_id]
      );

      await dbConnection.execute(
        'INSERT INTO users (id, name, nickname, phone, email, role, tenant_id, created_at, active) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), true)',
        [user2.id, user2.name, user2.nickname, user2.phone, user2.email, user2.role, user2.tenant_id]
      );

      const response = await request(app)
        .get('/api/users')
        .query({ role: 'admin' })
        .set('Authorization', 'Bearer mock-token')
        .set('x-tenant-id', 'tenant1')
        .set('x-user-permissions', 'user.read')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.users).toHaveLength(1);
      expect(response.body.data.users[0].tenantId).toBe('tenant1');
    });

    it('should return 403 when user lacks read permission', async () => {
      const response = await request(app)
        .get('/api/users')
        .query({ name: 'John' })
        .set('Authorization', 'Bearer mock-token')
        .set('x-tenant-id', 'tenant1')
        .set('x-user-permissions', 'user.create')
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Unauthorized');
      expect(response.body.message).toBe('User does not have permission to read users');
    });

    it('should return 400 when tenant ID is missing', async () => {
      const response = await request(app)
        .get('/api/users')
        .query({ name: 'John' })
        .set('Authorization', 'Bearer mock-token')
        .set('x-user-permissions', 'user.read')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Tenant ID is required');
    });

    it('should handle pagination correctly', async () => {
      // Create multiple users
      const users: Array<{
        id: string;
        name: string;
        nickname: string;
        phone: string;
        email: string;
        role: string;
        tenant_id: string;
      }> = [];
      
      for (let i = 1; i <= 15; i++) {
        users.push({
          id: `user${i}`,
          name: `User ${i}`,
          nickname: `user${i}`,
          phone: `123456789${i}`,
          email: `user${i}@example.com`,
          role: 'user',
          tenant_id: 'tenant1'
        });
      }

      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        if (user) {
          await dbConnection.execute(
            'INSERT INTO users (id, name, nickname, phone, email, role, tenant_id, created_at, active) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), true)',
            [user.id, user.name, user.nickname, user.phone, user.email, user.role, user.tenant_id]
          );
        }
      }

      const response = await request(app)
        .get('/api/users')
        .query({ role: 'user', page: 2, limit: 5 })
        .set('Authorization', 'Bearer mock-token')
        .set('x-tenant-id', 'tenant1')
        .set('x-user-permissions', 'user.read')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.users).toHaveLength(5);
      expect(response.body.data.page).toBe(2);
      expect(response.body.data.limit).toBe(5);
      expect(response.body.data.total).toBe(15);
      expect(response.body.data.totalPages).toBe(3);
    });
  });
}); 