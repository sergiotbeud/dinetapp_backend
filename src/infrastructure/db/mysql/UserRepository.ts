import { User, UserRepository as IUserRepository, SearchUserFilters, SearchUserResult } from '../../../domain/entities/User';
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

  async searchUsers(filters: SearchUserFilters): Promise<SearchUserResult> {
    let whereConditions: string[] = [];
    let values: any[] = [];

    // Filtros obligatorios
    whereConditions.push('tenant_id = ?');
    values.push(filters.tenantId);
    whereConditions.push('active = true');

    // Filtros opcionales
    if (filters.id) {
      whereConditions.push('id = ?');
      values.push(filters.id);
    }
    if (filters.name) {
      whereConditions.push('name LIKE ?');
      values.push(`%${filters.name}%`);
    }
    if (filters.email) {
      whereConditions.push('email = ?');
      values.push(filters.email);
    }
    if (filters.role) {
      whereConditions.push('role = ?');
      values.push(filters.role);
    }

    const whereClause = whereConditions.join(' AND ');

    // Conteo total
    const countQuery = `SELECT COUNT(*) as total FROM users WHERE ${whereClause}`;
    console.log('COUNT QUERY:', countQuery, values);
    const countResult = await this.db.execute(countQuery, values);
    const total = (countResult as any[])[0].total;

    // Paginación
    const page = Number.isInteger(Number(filters.page)) && Number(filters.page) > 0 ? Number(filters.page) : 1;
    const limit = Number.isInteger(Number(filters.limit)) && Number(filters.limit) > 0 ? Number(filters.limit) : 10;
    const offset = (page - 1) * limit;

    // Consulta de búsqueda
    const searchQuery = `
      SELECT id, name, nickname, phone, email, role, created_at, active, tenant_id
      FROM users
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    const searchValues = [...values];
    console.log('SEARCH QUERY:', searchQuery, searchValues);

    const rows = await this.db.execute(searchQuery, searchValues);
    const users = rows as any[];

    return {
      users: users.map(user => this.mapRowToUser(user)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
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