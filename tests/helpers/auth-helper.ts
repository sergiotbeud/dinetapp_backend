import request from 'supertest';
import app from '../../src/main';
import { DatabaseConnection } from '../../src/infrastructure/db/mysql/DatabaseConnection';
import { MySQLUserRepository } from '../../src/infrastructure/db/mysql/UserRepository';
import { MySQLTenantRepository } from '../../src/infrastructure/db/mysql/TenantRepository';

export class AuthHelper {
  private db: DatabaseConnection;
  private userRepository: MySQLUserRepository;
  private tenantRepository: MySQLTenantRepository;
  private tenantCounter = 0;
  private createdTenants = new Set<string>();
  private createdUsers = new Set<string>();
  private userPasswords = new Map<string, string>(); // Almacenar contraseñas originales

  constructor() {
    this.db = new DatabaseConnection();
    this.userRepository = new MySQLUserRepository(this.db);
    this.tenantRepository = new MySQLTenantRepository(this.db);
  }

  async createTestTenant(tenantData: {
    id: string;
    name: string;
    ownerEmail: string;
    status?: string;
  }) {
    // Si ya creamos este tenant, retornarlo directamente
    if (this.createdTenants.has(tenantData.id)) {
      return await this.tenantRepository.findById(tenantData.id);
    }

    try {
      const tenant = {
        id: tenantData.id,
        name: tenantData.name,
        businessName: `Business ${tenantData.name}`,
        ownerName: `Owner ${tenantData.name}`,
        ownerEmail: tenantData.ownerEmail,
        subscriptionPlan: 'basic'
      };

      await this.tenantRepository.create(tenant);
      this.createdTenants.add(tenantData.id);
      return tenant;
    } catch (error: any) {
      // Si es un error de duplicación, intentar obtener el tenant existente
      if (error.code === 'ER_DUP_ENTRY') {
        const existingTenant = await this.tenantRepository.findById(tenantData.id);
        if (existingTenant) {
          this.createdTenants.add(tenantData.id);
          return existingTenant;
        }
      }
      throw error;
    }
  }

  async createTestUser(userData: {
    id: string;
    name: string;
    nickname: string;
    phone: string;
    email: string;
    role: string;
    tenantId: string;
    password?: string;
  }) {
    // Si ya creamos este usuario, retornarlo directamente
    if (this.createdUsers.has(userData.id)) {
      return await this.userRepository.findById(userData.id, userData.tenantId);
    }

    // Asegurar que el tenant existe
    try {
      await this.createTestTenant({
        id: userData.tenantId,
        name: `Test Tenant ${userData.tenantId}`,
        ownerEmail: `${userData.tenantId}@test.com`
      });
    } catch (error) {
      // Ignorar errores de tenant duplicado
    }

    try {
      const password = userData.password || 'testPassword123';
      const user = {
        ...userData,
        password: password, // La contraseña se hasheará en el repositorio
        createdAt: new Date(),
        active: true
      };

      await this.userRepository.create(user);
      
      this.createdUsers.add(userData.id);
      this.userPasswords.set(userData.id, password); // Almacenar contraseña original (sin hashear)
      return user;
    } catch (error: any) {
      // Si es un error de duplicación, intentar obtener el usuario existente
      if (error.code === 'ER_DUP_ENTRY') {
        const existingUser = await this.userRepository.findById(userData.id, userData.tenantId);
        if (existingUser) {
          this.createdUsers.add(userData.id);
          this.userPasswords.set(userData.id, userData.password || 'testPassword123');
          return existingUser;
        }
      }
      throw error;
    }
  }

  async login(email: string, password: string, tenantId: string): Promise<string> {
    const response = await request(app)
      .post('/api/auth/login')
      .set('X-Tenant-ID', tenantId)
      .send({ email, password });

    if (response.status !== 200) {
      throw new Error(`Login failed: ${response.body.message}`);
    }

    return response.body.data.sessionId;
  }

  // Método para hacer login con un usuario creado por el helper
  async loginWithUser(userId: string, tenantId: string): Promise<string> {
    const password = this.userPasswords.get(userId);
    if (!password) {
      throw new Error(`No password found for user ${userId}`);
    }

    const user = await this.userRepository.findById(userId, tenantId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    return this.login(user.email, password, tenantId);
  }

  async cleanup() {
    await this.db.close();
  }

  getAuthHeaders(sessionId: string, tenantId: string, permissions: string[] = []) {
    return {
      'x-session-id': sessionId,
      'x-tenant-id': tenantId,
      'x-user-permissions': permissions.join(',')
    };
  }

  async cleanupTenant(tenantId: string) {
    try {
      await this.db.execute('DELETE FROM users WHERE tenant_id = ?', [tenantId]);
      await this.db.execute('DELETE FROM tenants WHERE id = ?', [tenantId]);
      
      // Limpiar de los sets de tracking
      this.createdTenants.delete(tenantId);
      for (const userId of this.createdUsers) {
        // Aquí podríamos verificar si el usuario pertenece al tenant, pero por simplicidad
        // solo limpiamos los usuarios que sabemos que fueron creados
      }
    } catch (error) {
      // Ignorar errores de limpieza
    }
  }

  // Método para generar IDs únicos para tests
  generateUniqueTenantId(): string {
    this.tenantCounter++;
    return `test-tenant-${Date.now()}-${this.tenantCounter}`;
  }

  // Método para limpiar todos los datos de prueba
  async cleanupAll() {
    try {
      await this.db.execute('DELETE FROM users WHERE tenant_id LIKE "test-tenant-%"');
      await this.db.execute('DELETE FROM tenants WHERE id LIKE "test-tenant-%"');
      this.createdTenants.clear();
      this.createdUsers.clear();
      this.userPasswords.clear();
    } catch (error) {
      // Ignorar errores de limpieza
    }
  }

  // Método para limpiar solo el estado interno (sin tocar la base de datos)
  clearInternalState() {
    this.createdTenants.clear();
    this.createdUsers.clear();
    this.userPasswords.clear();
    this.tenantCounter = 0;
  }

  async verifyUserExists(userId: string, tenantId: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId, tenantId);
    return user !== null;
  }

  async debugUserExists(userId: string, tenantId: string): Promise<any> {
    return await this.userRepository.findById(userId, tenantId);
  }
} 