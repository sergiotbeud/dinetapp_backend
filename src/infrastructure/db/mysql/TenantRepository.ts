import { Tenant, TenantRepository as ITenantRepository, CreateTenantDto, UpdateTenantDto } from '../../../domain/entities/Tenant';
import { DatabaseConnection } from './DatabaseConnection';

export class MySQLTenantRepository implements ITenantRepository {
  constructor(private db: DatabaseConnection) {}

  private mapRowToTenant(row: any): Tenant {
    return {
      id: row.id,
      name: row.name,
      businessName: row.business_name,
      ownerName: row.owner_name,
      ownerEmail: row.owner_email,
      phone: row.phone,
      address: row.address,
      taxId: row.tax_id,
      subscriptionPlan: row.subscription_plan,
      status: row.status,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  async create(tenant: CreateTenantDto): Promise<Tenant> {
    const query = `
      INSERT INTO tenants (
        id, name, business_name, owner_name, owner_email, 
        phone, address, tax_id, subscription_plan
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await this.db.execute(query, [
      tenant.id,
      tenant.name,
      tenant.businessName,
      tenant.ownerName,
      tenant.ownerEmail,
      tenant.phone || null,
      tenant.address || null,
      tenant.taxId || null,
      tenant.subscriptionPlan || 'basic'
    ]);

    return this.findById(tenant.id) as Promise<Tenant>;
  }

  async findById(id: string): Promise<Tenant | null> {
    const query = `
      SELECT id, name, business_name, owner_name, owner_email, 
             phone, address, tax_id, subscription_plan, status,
             created_at, updated_at
      FROM tenants 
      WHERE id = ?
    `;
    
    const rows = await this.db.execute(query, [id]);
    const tenants = rows as any[];
    
    if (tenants.length === 0) {
      return null;
    }
    
    return this.mapRowToTenant(tenants[0]);
  }

  async findByOwnerEmail(email: string): Promise<Tenant | null> {
    const query = `
      SELECT id, name, business_name, owner_name, owner_email, 
             phone, address, tax_id, subscription_plan, status,
             created_at, updated_at
      FROM tenants 
      WHERE owner_email = ?
    `;
    
    const rows = await this.db.execute(query, [email]);
    const tenants = rows as any[];
    
    if (tenants.length === 0) {
      return null;
    }
    
    return this.mapRowToTenant(tenants[0]);
  }

  async update(id: string, tenantData: UpdateTenantDto): Promise<Tenant> {
    const updateFields: string[] = [];
    const values: any[] = [];

    if (tenantData.name !== undefined) {
      updateFields.push('name = ?');
      values.push(tenantData.name);
    }
    if (tenantData.businessName !== undefined) {
      updateFields.push('business_name = ?');
      values.push(tenantData.businessName);
    }
    if (tenantData.ownerName !== undefined) {
      updateFields.push('owner_name = ?');
      values.push(tenantData.ownerName);
    }
    if (tenantData.ownerEmail !== undefined) {
      updateFields.push('owner_email = ?');
      values.push(tenantData.ownerEmail);
    }
    if (tenantData.phone !== undefined) {
      updateFields.push('phone = ?');
      values.push(tenantData.phone);
    }
    if (tenantData.address !== undefined) {
      updateFields.push('address = ?');
      values.push(tenantData.address);
    }
    if (tenantData.taxId !== undefined) {
      updateFields.push('tax_id = ?');
      values.push(tenantData.taxId);
    }
    if (tenantData.subscriptionPlan !== undefined) {
      updateFields.push('subscription_plan = ?');
      values.push(tenantData.subscriptionPlan);
    }
    if (tenantData.status !== undefined) {
      updateFields.push('status = ?');
      values.push(tenantData.status);
    }

    if (updateFields.length === 0) {
      throw new Error('No fields to update');
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const query = `
      UPDATE tenants 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `;

    await this.db.execute(query, values);
    
    const updatedTenant = await this.findById(id);
    if (!updatedTenant) {
      throw new Error('Tenant not found after update');
    }
    
    return updatedTenant;
  }

  async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM tenants WHERE id = ?';
    const result = await this.db.execute(query, [id]) as any;
    return result.affectedRows > 0;
  }

  async list(): Promise<Tenant[]> {
    const query = `
      SELECT id, name, business_name, owner_name, owner_email, 
             phone, address, tax_id, subscription_plan, status,
             created_at, updated_at
      FROM tenants 
      ORDER BY created_at DESC
    `;
    
    const rows = await this.db.execute(query);
    const tenants = rows as any[];
    
    return tenants.map(row => this.mapRowToTenant(row));
  }

  async searchTenants(filters: any): Promise<{ tenants: Tenant[]; total: number }> {
    const conditions: string[] = [];
    const values: any[] = [];
    const limit = parseInt(filters.limit) || 10;
    const page = parseInt(filters.page) || 1;
    const offset = (page - 1) * limit;

    // Construir condiciones de filtro
    if (filters.name) {
      conditions.push('(name LIKE ? OR business_name LIKE ?)');
      values.push(`%${filters.name}%`, `%${filters.name}%`);
    }

    if (filters.ownerEmail) {
      conditions.push('owner_email LIKE ?');
      values.push(`%${filters.ownerEmail}%`);
    }

    if (filters.status) {
      conditions.push('status = ?');
      values.push(filters.status);
    }

    if (filters.subscriptionPlan) {
      conditions.push('subscription_plan = ?');
      values.push(filters.subscriptionPlan);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Query para contar total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM tenants 
      ${whereClause}
    `;
    
    const countResult = await this.db.execute(countQuery, values);
    const total = (countResult as any[])[0].total;

    // Query para obtener datos paginados - usar valores directos para LIMIT y OFFSET
    const dataQuery = `
      SELECT id, name, business_name, owner_name, owner_email, 
             phone, address, tax_id, subscription_plan, status,
             created_at, updated_at
      FROM tenants 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    const rows = await this.db.execute(dataQuery, values);
    const tenants = rows as any[];
    
    return {
      tenants: tenants.map(row => this.mapRowToTenant(row)),
      total
    };
  }

  async isActive(id: string): Promise<boolean> {
    const tenant = await this.findById(id);
    return tenant?.status === 'active';
  }
} 