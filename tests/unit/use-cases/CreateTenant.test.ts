import { CreateTenant } from '../../../src/application/use-cases/CreateTenant';
import { TenantRepository } from '../../../src/domain/entities/Tenant';

describe('CreateTenant', () => {
  let mockTenantRepository: jest.Mocked<TenantRepository>;
  let createTenant: CreateTenant;

  beforeEach(() => {
    mockTenantRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByOwnerEmail: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      list: jest.fn(),
      isActive: jest.fn()
    };
    createTenant = new CreateTenant(mockTenantRepository);
  });

  const validTenantData = {
    id: 'paul-store',
    name: 'Tienda de Paul',
    businessName: 'Paul\'s Electronics Store',
    ownerName: 'Paul Johnson',
    ownerEmail: 'paul@paulstore.com',
    phone: '+1234567890',
    address: '123 Main St, City',
    taxId: 'TAX123456',
    subscriptionPlan: 'basic'
  };

  const mockCreatedTenant = {
    id: 'paul-store',
    name: 'Tienda de Paul',
    businessName: 'Paul\'s Electronics Store',
    ownerName: 'Paul Johnson',
    ownerEmail: 'paul@paulstore.com',
    phone: '+1234567890',
    address: '123 Main St, City',
    taxId: 'TAX123456',
    subscriptionPlan: 'basic',
    status: 'active' as const,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  describe('execute', () => {
    it('should create a tenant successfully with valid data', async () => {
      mockTenantRepository.findById.mockResolvedValue(null);
      mockTenantRepository.findByOwnerEmail.mockResolvedValue(null);
      mockTenantRepository.create.mockResolvedValue(mockCreatedTenant);

      const result = await createTenant.execute(validTenantData);

      expect(mockTenantRepository.findById).toHaveBeenCalledWith('paul-store');
      expect(mockTenantRepository.findByOwnerEmail).toHaveBeenCalledWith('paul@paulstore.com');
      expect(mockTenantRepository.create).toHaveBeenCalledWith(validTenantData);
      expect(result).toEqual(mockCreatedTenant);
    });

    it('should throw error when tenant ID is missing', async () => {
      const invalidData = { ...validTenantData, id: '' };

      await expect(createTenant.execute(invalidData)).rejects.toThrow('Tenant ID is required');
    });

    it('should throw error when tenant name is missing', async () => {
      const invalidData = { ...validTenantData, name: '' };

      await expect(createTenant.execute(invalidData)).rejects.toThrow('Tenant name is required');
    });

    it('should throw error when business name is missing', async () => {
      const invalidData = { ...validTenantData, businessName: '' };

      await expect(createTenant.execute(invalidData)).rejects.toThrow('Business name is required');
    });

    it('should throw error when owner name is missing', async () => {
      const invalidData = { ...validTenantData, ownerName: '' };

      await expect(createTenant.execute(invalidData)).rejects.toThrow('Owner name is required');
    });

    it('should throw error when owner email is missing', async () => {
      const invalidData = { ...validTenantData, ownerEmail: '' };

      await expect(createTenant.execute(invalidData)).rejects.toThrow('Owner email is required');
    });

    it('should throw error when owner email format is invalid', async () => {
      const invalidData = { ...validTenantData, ownerEmail: 'invalid-email' };

      await expect(createTenant.execute(invalidData)).rejects.toThrow('Invalid owner email format');
    });

    it('should throw error when tenant ID format is invalid', async () => {
      const invalidData = { ...validTenantData, id: 'paul_store' }; // underscore not allowed

      await expect(createTenant.execute(invalidData)).rejects.toThrow('Tenant ID can only contain letters, numbers, and hyphens');
    });

    it('should throw error when tenant ID is too short', async () => {
      const invalidData = { ...validTenantData, id: 'ab' };

      await expect(createTenant.execute(invalidData)).rejects.toThrow('Tenant ID must be between 3 and 50 characters');
    });

    it('should throw error when tenant ID is too long', async () => {
      const invalidData = { ...validTenantData, id: 'a'.repeat(51) };

      await expect(createTenant.execute(invalidData)).rejects.toThrow('Tenant ID must be between 3 and 50 characters');
    });

    it('should throw error when tenant ID already exists', async () => {
      mockTenantRepository.findById.mockResolvedValue(mockCreatedTenant);

      await expect(createTenant.execute(validTenantData)).rejects.toThrow('Tenant with ID paul-store already exists');
    });

    it('should throw error when owner email already exists', async () => {
      mockTenantRepository.findById.mockResolvedValue(null);
      mockTenantRepository.findByOwnerEmail.mockResolvedValue(mockCreatedTenant);

      await expect(createTenant.execute(validTenantData)).rejects.toThrow('Owner email paul@paulstore.com is already registered');
    });
  });
}); 