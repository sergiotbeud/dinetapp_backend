import { User, UserRepository as IUserRepository } from '../../../domain/entities/User';
import { DatabaseConnection } from './DatabaseConnection';

export class MySQLUserRepository implements IUserRepository {
  constructor(private db: DatabaseConnection) {}

  async create(user: Omit<User, 'createdAt' | 'active'>): Promise<User> {
    const query = `
      INSERT INTO users (id, name, nickname, phone, email, role, tenant_id, created_at, active)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), true)
    `;
    
    const values = [
      user.id,
      user.name,
      user.nickname,
      user.phone,
      user.email,
      user.role,
      user.tenantId,
    ];

    try {
      await this.db.execute(query, values);
      
      // Retornar el usuario creado
      const createdUser = await this.findById(user.id, user.tenantId);
      if (!createdUser) {
        throw new Error('Failed to retrieve created user');
      }
      
      return createdUser;
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        if (error.message.includes('email')) {
          throw new Error(`User with email ${user.email} already exists`);
        }
        if (error.message.includes('id')) {
          throw new Error(`User with ID ${user.id} already exists`);
        }
      }
      throw error;
    }
  }

  async findByEmail(email: string, tenantId: string): Promise<User | null> {
    const query = `
      SELECT id, name, nickname, phone, email, role, created_at, active, tenant_id
      FROM users 
      WHERE email = ? AND tenant_id = ? AND active = true
    `;
    
    const rows = await this.db.execute(query, [email, tenantId]);
    const users = rows as any[];
    
    if (users.length === 0) {
      return null;
    }
    
    return this.mapRowToUser(users[0]);
  }

  async findById(id: string, tenantId: string): Promise<User | null> {
    const query = `
      SELECT id, name, nickname, phone, email, role, created_at, active, tenant_id
      FROM users 
      WHERE id = ? AND tenant_id = ? AND active = true
    `;
    
    const rows = await this.db.execute(query, [id, tenantId]);
    const users = rows as any[];
    
    if (users.length === 0) {
      return null;
    }
    
    return this.mapRowToUser(users[0]);
  }

  async findByRole(role: string, tenantId: string): Promise<User[]> {
    const query = `
      SELECT id, name, nickname, phone, email, role, created_at, active, tenant_id
      FROM users 
      WHERE role = ? AND tenant_id = ? AND active = true
      ORDER BY created_at DESC
    `;
    
    const rows = await this.db.execute(query, [role, tenantId]);
    const users = rows as any[];
    
    return users.map(user => this.mapRowToUser(user));
  }

  private mapRowToUser(row: any): User {
    return {
      id: row.id,
      name: row.name,
      nickname: row.nickname,
      phone: row.phone,
      email: row.email,
      role: row.role,
      createdAt: new Date(row.created_at),
      active: Boolean(row.active),
      tenantId: row.tenant_id,
    };
  }
} 