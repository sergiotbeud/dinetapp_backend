export interface Tenant {
  id: string;
  name: string;
  businessName: string;
  ownerName: string;
  ownerEmail: string;
  phone?: string;
  address?: string;
  taxId?: string;
  subscriptionPlan: string;
  status: 'active' | 'suspended' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTenantDto {
  id: string;
  name: string;
  businessName: string;
  ownerName: string;
  ownerEmail: string;
  phone?: string;
  address?: string;
  taxId?: string;
  subscriptionPlan?: string;
}

export interface UpdateTenantDto {
  name?: string;
  businessName?: string;
  ownerName?: string;
  ownerEmail?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  subscriptionPlan?: string;
  status?: 'active' | 'suspended' | 'cancelled';
}

export interface TenantRepository {
  create(tenant: CreateTenantDto): Promise<Tenant>;
  findById(id: string): Promise<Tenant | null>;
  findByOwnerEmail(email: string): Promise<Tenant | null>;
  update(id: string, tenantData: UpdateTenantDto): Promise<Tenant>;
  delete(id: string): Promise<boolean>;
  list(): Promise<Tenant[]>;
  isActive(id: string): Promise<boolean>;
} 