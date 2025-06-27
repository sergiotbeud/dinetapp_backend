import { MySQLTenantRepository } from '../../infrastructure/db/mysql/TenantRepository';
import { SearchTenantFilters, validateSearchTenantDto } from '../dtos/SearchTenantDto';
import { Tenant } from '../../domain/entities/Tenant';

export class SearchTenants {
  constructor(private tenantRepository: MySQLTenantRepository) {}

  async execute(filters: any): Promise<{ tenants: any[]; total: number; page: number; limit: number; totalPages: number }> {
    // Validar filtros
    const validatedFilters = validateSearchTenantDto(filters);
    
    // Buscar tenants con filtros
    const result = await this.tenantRepository.searchTenants(validatedFilters);
    
    // Calcular información de paginación
    const totalPages = Math.ceil(result.total / validatedFilters.limit);
    
    return {
      tenants: result.tenants.map((tenant: Tenant) => ({
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
      })),
      total: result.total,
      page: validatedFilters.page,
      limit: validatedFilters.limit,
      totalPages
    };
  }
} 