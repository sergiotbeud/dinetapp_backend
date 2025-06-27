import { SearchTenants } from '../../../src/application/use-cases/SearchTenants';
import { MySQLTenantRepository } from '../../../src/infrastructure/db/mysql/TenantRepository';
import { Tenant } from '../../../src/domain/entities/Tenant';

// Mock del repositorio
const mockTenantRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findByOwnerEmail: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  list: jest.fn(),
  searchTenants: jest.fn(),
  isActive: jest.fn(),
  db: {},
  mapRowToTenant: jest.fn()
} as any;

describe('SearchTenants', () => {
  let searchTenants: SearchTenants;

  beforeEach(() => {
    searchTenants = new SearchTenants(mockTenantRepository);
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should search tenants with filters and return paginated results', async () => {
      // Arrange
      const mockTenants: Tenant[] = [
        {
          id: '1',
          name: 'Restaurante A',
          businessName: 'Restaurante A S.A.',
          ownerName: 'Juan Pérez',
          ownerEmail: 'juan@restaurantea.com',
          phone: '+1234567890',
          address: 'Calle 123, Ciudad',
          taxId: 'TAX123456',
          subscriptionPlan: 'premium',
          status: 'active',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        }
      ];

      const filters = {
        name: 'Restaurante',
        status: 'active',
        page: 1,
        limit: 10
      };

      mockTenantRepository.searchTenants.mockResolvedValue({
        tenants: mockTenants,
        total: 1
      });

      // Act
      const result = await searchTenants.execute(filters);

      // Assert
      expect(mockTenantRepository.searchTenants).toHaveBeenCalledWith({
        name: 'Restaurante',
        status: 'active',
        page: 1,
        limit: 10
      });

      expect(result).toEqual({
        tenants: [
          {
            id: '1',
            name: 'Restaurante A',
            businessName: 'Restaurante A S.A.',
            ownerName: 'Juan Pérez',
            ownerEmail: 'juan@restaurantea.com',
            phone: '+1234567890',
            address: 'Calle 123, Ciudad',
            taxId: 'TAX123456',
            subscriptionPlan: 'premium',
            status: 'active',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01')
          }
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1
      });
    });

    it('should calculate total pages correctly', async () => {
      // Arrange
      const mockTenants: Tenant[] = [];
      const filters = {
        page: 2,
        limit: 5
      };

      mockTenantRepository.searchTenants.mockResolvedValue({
        tenants: mockTenants,
        total: 12
      });

      // Act
      const result = await searchTenants.execute(filters);

      // Assert
      expect(result.totalPages).toBe(3); // 12 total / 5 per page = 3 pages
      expect(result.page).toBe(2);
      expect(result.limit).toBe(5);
    });

    it('should handle empty results', async () => {
      // Arrange
      const filters = {
        name: 'NonExistent',
        page: 1,
        limit: 10
      };

      mockTenantRepository.searchTenants.mockResolvedValue({
        tenants: [],
        total: 0
      });

      // Act
      const result = await searchTenants.execute(filters);

      // Assert
      expect(result.tenants).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });

    it('should use default pagination values when not provided', async () => {
      // Arrange
      const filters = {};
      const mockTenants: Tenant[] = [];

      mockTenantRepository.searchTenants.mockResolvedValue({
        tenants: mockTenants,
        total: 0
      });

      // Act
      const result = await searchTenants.execute(filters);

      // Assert
      expect(mockTenantRepository.searchTenants).toHaveBeenCalledWith({
        page: 1,
        limit: 10
      });
    });

    it('should throw error for invalid filters', async () => {
      // Arrange
      const invalidFilters = {
        page: -1, // Invalid page
        limit: 200 // Invalid limit (exceeds max)
      };

      // Act & Assert
      await expect(searchTenants.execute(invalidFilters)).rejects.toThrow('Validation error');
    });
  });
}); 