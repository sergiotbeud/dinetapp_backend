import { Tenant, TenantRepository, CreateTenantDto, UpdateTenantDto } from '../../domain/entities/Tenant';

export class TenantService {
  constructor(private tenantRepository: TenantRepository) {}

  async createTenant(tenantData: CreateTenantDto): Promise<Tenant> {
    // Validar que el tenant no existe
    const existingTenant = await this.tenantRepository.findById(tenantData.id);
    if (existingTenant) {
      throw new Error(`Tenant with ID ${tenantData.id} already exists`);
    }

    // Validar que el email del propietario no está en uso
    const existingByEmail = await this.tenantRepository.findByOwnerEmail(tenantData.ownerEmail);
    if (existingByEmail) {
      throw new Error(`Owner email ${tenantData.ownerEmail} is already registered`);
    }

    return this.tenantRepository.create(tenantData);
  }

  async getTenantById(id: string): Promise<Tenant | null> {
    return this.tenantRepository.findById(id);
  }

  async getTenantByOwnerEmail(email: string): Promise<Tenant | null> {
    return this.tenantRepository.findByOwnerEmail(email);
  }

  async updateTenant(id: string, tenantData: UpdateTenantDto): Promise<Tenant> {
    // Validar que el tenant existe
    const existingTenant = await this.tenantRepository.findById(id);
    if (!existingTenant) {
      throw new Error(`Tenant with ID ${id} not found`);
    }

    // Si se está actualizando el email, validar que no esté en uso
    if (tenantData.ownerEmail && tenantData.ownerEmail !== existingTenant.ownerEmail) {
      const existingByEmail = await this.tenantRepository.findByOwnerEmail(tenantData.ownerEmail);
      if (existingByEmail) {
        throw new Error(`Owner email ${tenantData.ownerEmail} is already registered`);
      }
    }

    return this.tenantRepository.update(id, tenantData);
  }

  async deleteTenant(id: string): Promise<boolean> {
    // Validar que el tenant existe
    const existingTenant = await this.tenantRepository.findById(id);
    if (!existingTenant) {
      throw new Error(`Tenant with ID ${id} not found`);
    }

    return this.tenantRepository.delete(id);
  }

  async listTenants(): Promise<Tenant[]> {
    return this.tenantRepository.list();
  }

  async isTenantActive(id: string): Promise<boolean> {
    return this.tenantRepository.isActive(id);
  }

  async activateTenant(id: string): Promise<Tenant> {
    return this.tenantRepository.update(id, { status: 'active' });
  }

  async suspendTenant(id: string): Promise<Tenant> {
    return this.tenantRepository.update(id, { status: 'suspended' });
  }

  async cancelTenant(id: string): Promise<Tenant> {
    return this.tenantRepository.update(id, { status: 'cancelled' });
  }
} 