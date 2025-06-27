import { User, UserRepository as IUserRepository, SearchUserFilters, SearchUserResult, UpdateUserRequest, DeleteUserRequest } from '../../../domain/entities/User';
import { DatabaseConnection } from './DatabaseConnection';
import { PasswordService } from '../../../application/services/PasswordService';

export class MySQLUserRepository implements IUserRepository {
  constructor(private db: DatabaseConnection) {}

  async create(user: Omit<User, 'createdAt' | 'active' | 'lastLogin'>): Promise<User> {
    const hashedPassword = await PasswordService.hashPassword(user.password);
    
    const query = `
      INSERT INTO users (id, name, nickname, phone, email, role, password, tenant_id, created_at, active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), true)
    `;
    
    try {
      await this.db.execute(query, [
        user.id,
        user.name,
        user.nickname,
        user.phone,
        user.email,
        user.role,
        hashedPassword,
        user.tenantId
      ]);
      
      return this.findById(user.id, user.tenantId) as Promise<User>;
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
      SELECT id, name, nickname, phone, email, role, password, created_at, updated_at, last_login, active, tenant_id
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
      SELECT id, name, nickname, phone, email, role, password, created_at, updated_at, last_login, active, tenant_id
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
      SELECT id, name, nickname, phone, email, role, password, created_at, updated_at, last_login, active, tenant_id
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

    whereConditions.push('tenant_id = ?');
    values.push(filters.tenantId);
    whereConditions.push('active = true');

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

    const countQuery = `SELECT COUNT(*) as total FROM users WHERE ${whereClause}`;
    const countResult = await this.db.execute(countQuery, values);
    const total = (countResult as any[])[0].total;

    const page = Number.isInteger(Number(filters.page)) && Number(filters.page) > 0 ? Number(filters.page) : 1;
    const limit = Number.isInteger(Number(filters.limit)) && Number(filters.limit) > 0 ? Number(filters.limit) : 10;
    const offset = (page - 1) * limit;

    const searchQuery = `
      SELECT id, name, nickname, phone, email, role, password, created_at, updated_at, last_login, active, tenant_id
      FROM users
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    const searchValues = [...values];

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

  async updateUser(id: string, tenantId: string, updates: UpdateUserRequest): Promise<User> {
    const existingUser = await this.findById(id, tenantId);
    if (!existingUser) {
      throw new Error(`User with ID ${id} not found`);
    }

    if (updates.email && updates.email !== existingUser.email) {
      const userWithSameEmail = await this.findByEmail(updates.email, tenantId);
      if (userWithSameEmail && userWithSameEmail.id !== id) {
        throw new Error(`User with email ${updates.email} already exists`);
      }
    }

    const updateFields: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      updateFields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.nickname !== undefined) {
      updateFields.push('nickname = ?');
      values.push(updates.nickname);
    }
    if (updates.phone !== undefined) {
      updateFields.push('phone = ?');
      values.push(updates.phone);
    }
    if (updates.email !== undefined) {
      updateFields.push('email = ?');
      values.push(updates.email);
    }
    if (updates.role !== undefined) {
      updateFields.push('role = ?');
      values.push(updates.role);
    }
    if (updates.password !== undefined) {
      const hashedPassword = await PasswordService.hashPassword(updates.password);
      updateFields.push('password = ?');
      values.push(hashedPassword);
    }

    updateFields.push('updated_at = NOW()');
    values.push(id, tenantId);

    const updateQuery = `
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = ? AND tenant_id = ? AND active = true
    `;

    try {
      await this.db.execute(updateQuery, values);
      
      const updatedUser = await this.findById(id, tenantId);
      if (!updatedUser) {
        throw new Error('Failed to retrieve updated user');
      }
      
      return updatedUser;
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        if (error.message.includes('email')) {
          throw new Error(`User with email ${updates.email} already exists`);
        }
      }
      throw error;
    }
  }

  async deleteUser(id: string, tenantId: string, data: DeleteUserRequest): Promise<boolean> {
    const existingUser = await this.findById(id, tenantId);
    if (!existingUser) {
      throw new Error(`User with ID ${id} not found`);
    }

    const deleteQuery = `
      UPDATE users 
      SET active = false, updated_at = NOW()
      WHERE id = ? AND tenant_id = ? AND active = true
    `;

    try {
      const result = await this.db.execute(deleteQuery, [id, tenantId]);
      const affectedRows = (result as any).affectedRows;
      return affectedRows > 0;
    } catch (error) {
      throw new Error(`Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async validateCredentials(email: string, password: string, tenantId: string): Promise<User | null> {
    const user = await this.findByEmail(email, tenantId);
    if (!user) {
      return null;
    }

    const isValidPassword = await PasswordService.comparePassword(password, user.password);
    if (!isValidPassword) {
      return null;
    }

    return user;
  }

  async updateLastLogin(id: string, tenantId: string): Promise<void> {
    const query = `
      UPDATE users 
      SET last_login = NOW()
      WHERE id = ? AND tenant_id = ? AND active = true
    `;

    await this.db.execute(query, [id, tenantId]);
  }

  private mapRowToUser(row: any): User {
    const user: User = {
      id: row.id,
      name: row.name,
      nickname: row.nickname,
      phone: row.phone,
      email: row.email,
      role: row.role,
      password: row.password,
      createdAt: new Date(row.created_at),
      active: Boolean(row.active),
      tenantId: row.tenant_id,
    };
    
    if (row.updated_at) {
      user.updatedAt = new Date(row.updated_at);
    }
    
    if (row.last_login) {
      user.lastLogin = new Date(row.last_login);
    }
    
    return user;
  }
} 