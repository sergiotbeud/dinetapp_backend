import { CreateUser } from '../../../src/application/use-cases/CreateUser';
import { UserRepository, User } from '../../../src/domain/entities/User';
import { UnauthorizedError, UserDuplicateError } from '../../../src/domain/entities/User';

// Mock del repositorio
const mockUserRepository: jest.Mocked<UserRepository> = {
  create: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
  findByRole: jest.fn(),
  searchUsers: jest.fn(),
};

describe('CreateUser Use Case', () => {
  let createUserUseCase: CreateUser;

  beforeEach(() => {
    createUserUseCase = new CreateUser(mockUserRepository);
    jest.clearAllMocks();
  });

  const validUserData = {
    id: 'user123',
    name: 'John Doe',
    nickname: 'johndoe',
    phone: '+1234567890',
    email: 'john@example.com',
    role: 'cashier'
  };

  const validPermissions = ['user.create'];
  const tenantId = 'tenant123';

  describe('execute', () => {
    it('should create a user successfully when all validations pass', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.findById.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue({
        ...validUserData,
        createdAt: new Date(),
        active: true,
        tenantId
      });

      // Act
      const result = await createUserUseCase.execute(validUserData, tenantId, validPermissions);

      // Assert
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(validUserData.email, tenantId);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(validUserData.id, tenantId);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        ...validUserData,
        tenantId
      });
      expect(result).toEqual({
        ...validUserData,
        createdAt: expect.any(Date),
        active: true,
        tenantId
      });
    });

    it('should throw UnauthorizedError when user lacks user.create permission', async () => {
      // Arrange
      const invalidPermissions = ['user.read'];

      // Act & Assert
      await expect(
        createUserUseCase.execute(validUserData, tenantId, invalidPermissions)
      ).rejects.toThrow(UnauthorizedError);
      await expect(
        createUserUseCase.execute(validUserData, tenantId, invalidPermissions)
      ).rejects.toThrow('User does not have permission to create users');
    });

    it('should throw UserDuplicateError when email already exists', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue({
        ...validUserData,
        createdAt: new Date(),
        active: true,
        tenantId
      });

      // Act & Assert
      await expect(
        createUserUseCase.execute(validUserData, tenantId, validPermissions)
      ).rejects.toThrow(UserDuplicateError);
      await expect(
        createUserUseCase.execute(validUserData, tenantId, validPermissions)
      ).rejects.toThrow(`User with email ${validUserData.email} already exists`);
    });

    it('should throw UserDuplicateError when ID already exists', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.findById.mockResolvedValue({
        ...validUserData,
        createdAt: new Date(),
        active: true,
        tenantId
      });

      // Act & Assert
      await expect(
        createUserUseCase.execute(validUserData, tenantId, validPermissions)
      ).rejects.toThrow(UserDuplicateError);
      await expect(
        createUserUseCase.execute(validUserData, tenantId, validPermissions)
      ).rejects.toThrow(`User with ID ${validUserData.id} already exists`);
    });
  });
}); 