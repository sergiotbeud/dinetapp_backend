import { TenantRepository, CreateTenantDto } from '../../domain/entities/Tenant';

export interface CreateTenantUseCase {
  execute(data: CreateTenantDto): Promise<any>;
}

export class CreateTenant implements CreateTenantUseCase {
  constructor(private tenantRepository: TenantRepository) {}

  async execute(data: CreateTenantDto): Promise<any> {
    // Validaciones básicas
    if (!data.id || data.id.trim().length === 0) {
      throw new Error('Tenant ID is required');
    }

    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Tenant name is required');
    }

    if (!data.businessName || data.businessName.trim().length === 0) {
      throw new Error('Business name is required');
    }

    if (!data.ownerName || data.ownerName.trim().length === 0) {
      throw new Error('Owner name is required');
    }

    if (!data.ownerEmail || data.ownerEmail.trim().length === 0) {
      throw new Error('Owner email is required');
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.ownerEmail)) {
      throw new Error('Invalid owner email format');
    }

    // Validar que el ID del tenant sea válido (solo letras, números, guiones)
    const idRegex = /^[a-zA-Z0-9-]+$/;
    if (!idRegex.test(data.id)) {
      throw new Error('Tenant ID can only contain letters, numbers, and hyphens');
    }

    // Validar longitud del ID
    if (data.id.length < 3 || data.id.length > 50) {
      throw new Error('Tenant ID must be between 3 and 50 characters');
    }

    // Validar que el ID no exista
    const existingTenantById = await this.tenantRepository.findById(data.id);
    if (existingTenantById) {
      throw new Error(`Tenant with ID ${data.id} already exists`);
    }

    // Validar que el email no exista
    const existingTenantByEmail = await this.tenantRepository.findByOwnerEmail(data.ownerEmail);
    if (existingTenantByEmail) {
      throw new Error(`Owner email ${data.ownerEmail} is already registered`);
    }

    const tenant = await this.tenantRepository.create(data);
    
    return {
      id: tenant.id,
      name: tenant.name,
      businessName: tenant.businessName,
      ownerName: tenant.ownerName,
      ownerEmail: tenant.ownerEmail,
      phone: tenant.phone,
      address: tenant.address,
      taxId: tenant.taxId,
      subscriptionPlan: tenant.subscriptionPlan,
      status: tenant.status,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt
    };
  }
} 