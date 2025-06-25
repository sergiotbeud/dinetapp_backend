import { SearchUsers } from '../../../src/application/use-cases/SearchUsers';
import { UserRepository, SearchUserFilters, SearchUserResult } from '../../../src/domain/entities/User';

describe('SearchUsers', () => {
  let searchUsers: SearchUsers;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockUserRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      findByRole: jest.fn(),
      searchUsers: jest.fn(),
    };

    searchUsers = new SearchUsers(mockUserRepository);
  });

  describe('execute', () => {
    it('should search users with valid filters', async () => {
      const filters: SearchUserFilters = {
        tenantId: 'tenant1',
        name: 'John',
        page: 1,
        limit: 10
      };

      const mockResult = {
        users: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      };

      mockUserRepository.searchUsers.mockResolvedValue(mockResult);

      const result = await searchUsers.execute(filters);

      expect(mockUserRepository.searchUsers).toHaveBeenCalledWith(filters);
      expect(result).toEqual(mockResult);
    });

    it('should throw error when no filters are provided', async () => {
      const filters: SearchUserFilters = {
        tenantId: 'tenant1',
        page: 1,
        limit: 10
      };

      await expect(searchUsers.execute(filters)).rejects.toThrow('At least one search filter must be provided');
    });

    it('should throw error when page is less than 1', async () => {
      const filters: SearchUserFilters = {
        tenantId: 'tenant1',
        name: 'John',
        page: 0,
        limit: 10
      };

      await expect(searchUsers.execute(filters)).rejects.toThrow('Page must be greater than 0');
    });

    it('should throw error when limit is less than 1', async () => {
      const filters: SearchUserFilters = {
        tenantId: 'tenant1',
        name: 'John',
        page: 1,
        limit: 0
      };

      await expect(searchUsers.execute(filters)).rejects.toThrow('Limit must be between 1 and 100');
    });

    it('should throw error when limit is greater than 100', async () => {
      const filters: SearchUserFilters = {
        tenantId: 'tenant1',
        name: 'John',
        page: 1,
        limit: 101
      };

      await expect(searchUsers.execute(filters)).rejects.toThrow('Limit must be between 1 and 100');
    });

    it('should accept limit of 100', async () => {
      const filters: SearchUserFilters = {
        tenantId: 'tenant1',
        name: 'John',
        page: 1,
        limit: 100
      };

      const mockResult = {
        users: [],
        total: 0,
        page: 1,
        limit: 100,
        totalPages: 0
      };

      mockUserRepository.searchUsers.mockResolvedValue(mockResult);

      const result = await searchUsers.execute(filters);

      expect(mockUserRepository.searchUsers).toHaveBeenCalledWith(filters);
      expect(result).toEqual(mockResult);
    });

    it('should accept page of 1', async () => {
      const filters: SearchUserFilters = {
        tenantId: 'tenant1',
        name: 'John',
        page: 1,
        limit: 10
      };

      const mockResult = {
        users: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      };

      mockUserRepository.searchUsers.mockResolvedValue(mockResult);

      const result = await searchUsers.execute(filters);

      expect(mockUserRepository.searchUsers).toHaveBeenCalledWith(filters);
      expect(result).toEqual(mockResult);
    });

    it('should accept page greater than 1', async () => {
      const filters: SearchUserFilters = {
        tenantId: 'tenant1',
        name: 'John',
        page: 5,
        limit: 10
      };

      const mockResult = {
        users: [],
        total: 0,
        page: 5,
        limit: 10,
        totalPages: 0
      };

      mockUserRepository.searchUsers.mockResolvedValue(mockResult);

      const result = await searchUsers.execute(filters);

      expect(mockUserRepository.searchUsers).toHaveBeenCalledWith(filters);
      expect(result).toEqual(mockResult);
    });

    it('should work with only id filter', async () => {
      const filters: SearchUserFilters = {
        tenantId: 'tenant1',
        id: 'user123',
        page: 1,
        limit: 10
      };

      const mockResult = {
        users: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      };

      mockUserRepository.searchUsers.mockResolvedValue(mockResult);

      const result = await searchUsers.execute(filters);

      expect(mockUserRepository.searchUsers).toHaveBeenCalledWith(filters);
      expect(result).toEqual(mockResult);
    });

    it('should work with only email filter', async () => {
      const filters: SearchUserFilters = {
        tenantId: 'tenant1',
        email: 'test@example.com',
        page: 1,
        limit: 10
      };

      const mockResult = {
        users: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      };

      mockUserRepository.searchUsers.mockResolvedValue(mockResult);

      const result = await searchUsers.execute(filters);

      expect(mockUserRepository.searchUsers).toHaveBeenCalledWith(filters);
      expect(result).toEqual(mockResult);
    });

    it('should work with only role filter', async () => {
      const filters: SearchUserFilters = {
        tenantId: 'tenant1',
        role: 'admin',
        page: 1,
        limit: 10
      };

      const mockResult = {
        users: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      };

      mockUserRepository.searchUsers.mockResolvedValue(mockResult);

      const result = await searchUsers.execute(filters);

      expect(mockUserRepository.searchUsers).toHaveBeenCalledWith(filters);
      expect(result).toEqual(mockResult);
    });

    it('should search users with ID filter', async () => {
      const filters: SearchUserFilters = {
        tenantId: 'tenant1',
        id: 'user1',
        page: 1,
        limit: 10
      };

      const mockResult: SearchUserResult = {
        users: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      };

      mockUserRepository.searchUsers.mockResolvedValue(mockResult);

      const result = await searchUsers.execute(filters);

      expect(mockUserRepository.searchUsers).toHaveBeenCalledWith(filters);
      expect(result).toEqual(mockResult);
    });

    it('should search users with email filter', async () => {
      const filters: SearchUserFilters = {
        tenantId: 'tenant1',
        email: 'john@example.com',
        page: 1,
        limit: 10
      };

      const mockResult: SearchUserResult = {
        users: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      };

      mockUserRepository.searchUsers.mockResolvedValue(mockResult);

      const result = await searchUsers.execute(filters);

      expect(mockUserRepository.searchUsers).toHaveBeenCalledWith(filters);
      expect(result).toEqual(mockResult);
    });

    it('should search users with role filter', async () => {
      const filters: SearchUserFilters = {
        tenantId: 'tenant1',
        role: 'admin',
        page: 1,
        limit: 10
      };

      const mockResult: SearchUserResult = {
        users: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      };

      mockUserRepository.searchUsers.mockResolvedValue(mockResult);

      const result = await searchUsers.execute(filters);

      expect(mockUserRepository.searchUsers).toHaveBeenCalledWith(filters);
      expect(result).toEqual(mockResult);
    });

    it('should search users with combined filters', async () => {
      const filters: SearchUserFilters = {
        tenantId: 'tenant1',
        name: 'John',
        role: 'admin',
        page: 1,
        limit: 10
      };

      const mockResult: SearchUserResult = {
        users: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      };

      mockUserRepository.searchUsers.mockResolvedValue(mockResult);

      const result = await searchUsers.execute(filters);

      expect(mockUserRepository.searchUsers).toHaveBeenCalledWith(filters);
      expect(result).toEqual(mockResult);
    });
  });
}); 