import { DeleteUser } from '../../../src/application/use-cases/DeleteUser';
import { UserRepository } from '../../../src/domain/entities/User';

describe('DeleteUser', () => {
  let deleteUser: DeleteUser;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockUserRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      findByRole: jest.fn(),
      searchUsers: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
      validateCredentials: jest.fn(),
      updateLastLogin: jest.fn(),
    };

    deleteUser = new DeleteUser(mockUserRepository);
  });

  describe('execute', () => {
    const userId = 'user123';
    const tenantId = 'tenant1';
    const userPermissions = ['user.delete'];
    const deleteData = { reason: 'User left the company' };

    it('should delete user successfully when user exists and has permissions', async () => {
      const mockUser = {
        id: userId,
        name: 'John Doe',
        nickname: 'johndoe',
        phone: '+1234567890',
        email: 'john@example.com',
        role: 'cashier',
        password: 'password123',
        createdAt: new Date(),
        active: true,
        tenantId,
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.deleteUser.mockResolvedValue(true);

      const result = await deleteUser.execute(userId, deleteData, tenantId, userPermissions);

      expect(result).toBe(true);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId, tenantId);
      expect(mockUserRepository.deleteUser).toHaveBeenCalledWith(userId, tenantId, deleteData);
    });

    it('should throw UnauthorizedError when user lacks delete permission', async () => {
      const userPermissionsWithoutDelete = ['user.read'];

      await expect(
        deleteUser.execute(userId, deleteData, tenantId, userPermissionsWithoutDelete)
      ).rejects.toThrow('User does not have permission to delete users');

      expect(mockUserRepository.findById).not.toHaveBeenCalled();
      expect(mockUserRepository.deleteUser).not.toHaveBeenCalled();
    });

    it('should throw UserNotFoundError when user does not exist', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(
        deleteUser.execute(userId, deleteData, tenantId, userPermissions)
      ).rejects.toThrow(`User with ID ${userId} not found`);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId, tenantId);
      expect(mockUserRepository.deleteUser).not.toHaveBeenCalled();
    });

    it('should throw UserNotFoundError when user belongs to different tenant', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(
        deleteUser.execute(userId, deleteData, tenantId, userPermissions)
      ).rejects.toThrow(`User with ID ${userId} not found`);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId, tenantId);
      expect(mockUserRepository.deleteUser).not.toHaveBeenCalled();
    });

    it('should throw UserValidationError when delete data is invalid', async () => {
      const mockUser = {
        id: userId,
        name: 'John Doe',
        nickname: 'johndoe',
        phone: '+1234567890',
        email: 'john@example.com',
        role: 'cashier',
        password: 'password123',
        createdAt: new Date(),
        active: true,
        tenantId,
      };

      const invalidDeleteData = { reason: 'a'.repeat(501) }; // Exceeds 500 character limit

      mockUserRepository.findById.mockResolvedValue(mockUser);

      await expect(
        deleteUser.execute(userId, invalidDeleteData, tenantId, userPermissions)
      ).rejects.toThrow('Reason must not exceed 500 characters');

      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId, tenantId);
      expect(mockUserRepository.deleteUser).not.toHaveBeenCalled();
    });

    it('should delete user successfully with empty delete data', async () => {
      const mockUser = {
        id: userId,
        name: 'John Doe',
        nickname: 'johndoe',
        phone: '+1234567890',
        email: 'john@example.com',
        role: 'cashier',
        password: 'password123',
        createdAt: new Date(),
        active: true,
        tenantId,
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.deleteUser.mockResolvedValue(true);

      const result = await deleteUser.execute(userId, {}, tenantId, userPermissions);

      expect(result).toBe(true);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId, tenantId);
      expect(mockUserRepository.deleteUser).toHaveBeenCalledWith(userId, tenantId, {});
    });

    it('should handle repository errors gracefully', async () => {
      const mockUser = {
        id: userId,
        name: 'John Doe',
        nickname: 'johndoe',
        phone: '+1234567890',
        email: 'john@example.com',
        role: 'cashier',
        password: 'password123',
        createdAt: new Date(),
        active: true,
        tenantId,
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.deleteUser.mockRejectedValue(new Error('Database connection failed'));

      await expect(
        deleteUser.execute(userId, deleteData, tenantId, userPermissions)
      ).rejects.toThrow('Database connection failed');

      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId, tenantId);
      expect(mockUserRepository.deleteUser).toHaveBeenCalledWith(userId, tenantId, deleteData);
    });
  });
}); 