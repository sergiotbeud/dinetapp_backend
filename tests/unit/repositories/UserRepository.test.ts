import { MySQLUserRepository } from '../../../src/infrastructure/db/mysql/UserRepository';
import { DatabaseConnection } from '../../../src/infrastructure/db/mysql/DatabaseConnection';
import { User, SearchUserFilters } from '../../../src/domain/entities/User';

describe('MySQLUserRepository', () => {
  let userRepository: MySQLUserRepository;
  let mockDb: jest.Mocked<DatabaseConnection>;

  beforeEach(() => {
    mockDb = {
      execute: jest.fn(),
    } as any;

    userRepository = new MySQLUserRepository(mockDb);
  });

  describe('create', () => {
    it('should create user successfully', async () => {
      const userData = {
        id: 'user1',
        name: 'John Doe',
        nickname: 'johndoe',
        phone: '123456789',
        email: 'john@example.com',
        role: 'admin',
        tenantId: 'tenant1'
      };

      const createdUser = {
        ...userData,
        createdAt: new Date(),
        active: true
      };

      mockDb.execute
        .mockResolvedValueOnce([]) // Para la inserción
        .mockResolvedValueOnce([createdUser]); // Para findById

      const result = await userRepository.create(userData);

      expect(mockDb.execute).toHaveBeenCalledTimes(2);
      expect(result).toEqual(expect.objectContaining({
        id: 'user1',
        name: 'John Doe',
        nickname: 'johndoe',
        phone: '123456789',
        email: 'john@example.com',
        role: 'admin',
        createdAt: expect.any(Date),
        active: true
      }));
    });

    it('should throw error when user with same email exists', async () => {
      const userData = {
        id: 'user1',
        name: 'John Doe',
        nickname: 'johndoe',
        phone: '123456789',
        email: 'john@example.com',
        role: 'admin',
        tenantId: 'tenant1'
      };

      const duplicateError = new Error('Duplicate entry');
      (duplicateError as any).code = 'ER_DUP_ENTRY';
      (duplicateError as any).message = 'Duplicate entry for key \'users.email\'';

      mockDb.execute.mockRejectedValueOnce(duplicateError);

      await expect(userRepository.create(userData)).rejects.toThrow(
        'User with email john@example.com already exists'
      );
    });

    it('should throw error when user with same ID exists', async () => {
      const userData = {
        id: 'user1',
        name: 'John Doe',
        nickname: 'johndoe',
        phone: '123456789',
        email: 'john@example.com',
        role: 'admin',
        tenantId: 'tenant1'
      };

      const duplicateError = new Error('Duplicate entry');
      (duplicateError as any).code = 'ER_DUP_ENTRY';
      (duplicateError as any).message = 'Duplicate entry for key \'users.id\'';

      mockDb.execute.mockRejectedValueOnce(duplicateError);

      await expect(userRepository.create(userData)).rejects.toThrow(
        'User with ID user1 already exists'
      );
    });

    it('should throw error when created user cannot be retrieved', async () => {
      const userData = {
        id: 'user1',
        name: 'John Doe',
        nickname: 'johndoe',
        phone: '123456789',
        email: 'john@example.com',
        role: 'admin',
        tenantId: 'tenant1'
      };

      mockDb.execute
        .mockResolvedValueOnce([]) // Para la inserción
        .mockResolvedValueOnce([]); // Para findById - sin resultados

      await expect(userRepository.create(userData)).rejects.toThrow(
        'Failed to retrieve created user'
      );
    });
  });

  describe('findByEmail', () => {
    it('should return user when found', async () => {
      const email = 'john@example.com';
      const tenantId = 'tenant1';

      const mockUser = {
        id: 'user1',
        name: 'John Doe',
        nickname: 'johndoe',
        phone: '123456789',
        email: 'john@example.com',
        role: 'admin',
        created_at: new Date(),
        active: 1,
        tenant_id: 'tenant1'
      };

      mockDb.execute.mockResolvedValueOnce([mockUser]);

      const result = await userRepository.findByEmail(email, tenantId);

      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [email, tenantId]
      );
      expect(result).toEqual({
        id: 'user1',
        name: 'John Doe',
        nickname: 'johndoe',
        phone: '123456789',
        email: 'john@example.com',
        role: 'admin',
        createdAt: expect.any(Date),
        active: true,
        tenantId: 'tenant1'
      });
    });

    it('should return null when user not found', async () => {
      const email = 'nonexistent@example.com';
      const tenantId = 'tenant1';

      mockDb.execute.mockResolvedValueOnce([]);

      const result = await userRepository.findByEmail(email, tenantId);

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      const id = 'user1';
      const tenantId = 'tenant1';

      const mockUser = {
        id: 'user1',
        name: 'John Doe',
        nickname: 'johndoe',
        phone: '123456789',
        email: 'john@example.com',
        role: 'admin',
        created_at: new Date(),
        active: 1,
        tenant_id: 'tenant1'
      };

      mockDb.execute.mockResolvedValueOnce([mockUser]);

      const result = await userRepository.findById(id, tenantId);

      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [id, tenantId]
      );
      expect(result).toEqual({
        id: 'user1',
        name: 'John Doe',
        nickname: 'johndoe',
        phone: '123456789',
        email: 'john@example.com',
        role: 'admin',
        createdAt: expect.any(Date),
        active: true,
        tenantId: 'tenant1'
      });
    });

    it('should return null when user not found', async () => {
      const id = 'nonexistent';
      const tenantId = 'tenant1';

      mockDb.execute.mockResolvedValueOnce([]);

      const result = await userRepository.findById(id, tenantId);

      expect(result).toBeNull();
    });
  });

  describe('findByRole', () => {
    it('should return users when found', async () => {
      const role = 'admin';
      const tenantId = 'tenant1';

      const mockUsers = [
        {
          id: 'user1',
          name: 'John Doe',
          nickname: 'johndoe',
          phone: '123456789',
          email: 'john@example.com',
          role: 'admin',
          created_at: new Date(),
          active: 1,
          tenant_id: 'tenant1'
        }
      ];

      mockDb.execute.mockResolvedValueOnce(mockUsers);

      const result = await userRepository.findByRole(role, tenantId);

      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [role, tenantId]
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'user1',
        name: 'John Doe',
        nickname: 'johndoe',
        phone: '123456789',
        email: 'john@example.com',
        role: 'admin',
        createdAt: expect.any(Date),
        active: true,
        tenantId: 'tenant1'
      });
    });

    it('should return empty array when no users found', async () => {
      const role = 'nonexistent';
      const tenantId = 'tenant1';

      mockDb.execute.mockResolvedValueOnce([]);

      const result = await userRepository.findByRole(role, tenantId);

      expect(result).toEqual([]);
    });
  });

  describe('searchUsers', () => {
    it('should search users with all filters', async () => {
      const filters: SearchUserFilters = {
        tenantId: 'tenant1',
        id: 'user1',
        name: 'John',
        email: 'john@example.com',
        role: 'admin',
        page: 1,
        limit: 10
      };

      const mockCountResult = [{ total: 1 }];
      const mockUsers = [
        {
          id: 'user1',
          name: 'John Doe',
          nickname: 'johndoe',
          phone: '123456789',
          email: 'john@example.com',
          role: 'admin',
          created_at: new Date(),
          active: 1,
          tenant_id: 'tenant1'
        }
      ];

      mockDb.execute
        .mockResolvedValueOnce(mockCountResult)
        .mockResolvedValueOnce(mockUsers);

      const result = await userRepository.searchUsers(filters);

      expect(mockDb.execute).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        users: expect.arrayContaining([
          expect.objectContaining({
            id: 'user1',
            name: 'John Doe'
          })
        ]),
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1
      });
    });

    it('should handle pagination correctly', async () => {
      const filters: SearchUserFilters = {
        tenantId: 'tenant1',
        name: 'John',
        page: 2,
        limit: 5
      };

      const mockCountResult = [{ total: 15 }];
      const mockUsers: any[] = [];

      mockDb.execute
        .mockResolvedValueOnce(mockCountResult)
        .mockResolvedValueOnce(mockUsers);

      const result = await userRepository.searchUsers(filters);

      expect(result).toEqual({
        users: [],
        total: 15,
        page: 2,
        limit: 5,
        totalPages: 3
      });
    });

    it('should handle empty results', async () => {
      const filters: SearchUserFilters = {
        tenantId: 'tenant1',
        name: 'Nonexistent',
        page: 1,
        limit: 10
      };

      const mockCountResult = [{ total: 0 }];
      const mockUsers: any[] = [];

      mockDb.execute
        .mockResolvedValueOnce(mockCountResult)
        .mockResolvedValueOnce(mockUsers);

      const result = await userRepository.searchUsers(filters);

      expect(result).toEqual({
        users: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      });
    });
  });
}); 