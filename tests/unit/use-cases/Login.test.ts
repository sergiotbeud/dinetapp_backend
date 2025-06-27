import { Login } from '../../../src/application/use-cases/Login';
import { UserRepository } from '../../../src/domain/entities/User';
import { SessionManager } from '../../../src/infrastructure/session/SessionManager';

describe('Login', () => {
  let login: Login;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockSessionManager: Partial<SessionManager>;

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

    mockSessionManager = {
      createSession: jest.fn(),
      getSession: jest.fn(),
      deleteSession: jest.fn(),
      destroy: jest.fn(),
    };

    login = new Login(mockUserRepository, mockSessionManager as SessionManager);
  });

  describe('execute', () => {
    const loginData = { email: 'test@example.com', password: 'password123' };
    const tenantId = 'tenant1';
    const mockUser = {
      id: 'user123',
      name: 'John Doe',
      nickname: 'johndoe',
      phone: '+1234567890',
      email: 'test@example.com',
      role: 'admin',
      password: 'hashedPassword',
      createdAt: new Date(),
      active: true,
      tenantId,
    };

    it('should login successfully with valid credentials', async () => {
      mockUserRepository.validateCredentials.mockResolvedValue(mockUser);
      (mockSessionManager.createSession as jest.Mock).mockReturnValue('session123');
      mockUserRepository.updateLastLogin.mockResolvedValue();

      const result = await login.execute(loginData, tenantId);

      expect(result.sessionId).toBe('session123');
      expect(result.user).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
        tenantId: mockUser.tenantId
      });
      expect(mockUserRepository.validateCredentials).toHaveBeenCalledWith(
        loginData.email,
        loginData.password,
        tenantId
      );
      expect(mockSessionManager.createSession).toHaveBeenCalledWith(
        mockUser.id,
        mockUser.tenantId,
        ['user.create', 'user.read', 'user.update', 'user.delete']
      );
      expect(mockUserRepository.updateLastLogin).toHaveBeenCalledWith(mockUser.id, mockUser.tenantId);
    });

    it('should throw AuthenticationError with invalid credentials', async () => {
      mockUserRepository.validateCredentials.mockResolvedValue(null);

      await expect(login.execute(loginData, tenantId)).rejects.toThrow('Invalid email or password');

      expect(mockUserRepository.validateCredentials).toHaveBeenCalledWith(
        loginData.email,
        loginData.password,
        tenantId
      );
      expect(mockSessionManager.createSession).not.toHaveBeenCalled();
    });

    it('should throw AuthenticationError with inactive user', async () => {
      const inactiveUser = { ...mockUser, active: false };
      mockUserRepository.validateCredentials.mockResolvedValue(inactiveUser);

      await expect(login.execute(loginData, tenantId)).rejects.toThrow('User account is inactive');

      expect(mockUserRepository.validateCredentials).toHaveBeenCalledWith(
        loginData.email,
        loginData.password,
        tenantId
      );
      expect(mockSessionManager.createSession).not.toHaveBeenCalled();
    });

    it('should throw AuthenticationError with invalid email format', async () => {
      const invalidData = { email: 'invalid-email', password: 'password123' };

      await expect(login.execute(invalidData, tenantId)).rejects.toThrow('Email must be a valid email address');

      expect(mockUserRepository.validateCredentials).not.toHaveBeenCalled();
      expect(mockSessionManager.createSession).not.toHaveBeenCalled();
    });

    it('should throw AuthenticationError with empty password', async () => {
      const invalidData = { email: 'test@example.com', password: '' };

      await expect(login.execute(invalidData, tenantId)).rejects.toThrow('Password cannot be empty');

      expect(mockUserRepository.validateCredentials).not.toHaveBeenCalled();
      expect(mockSessionManager.createSession).not.toHaveBeenCalled();
    });

    it('should assign correct permissions for manager role', async () => {
      const managerUser = { ...mockUser, role: 'manager' };
      mockUserRepository.validateCredentials.mockResolvedValue(managerUser);
      (mockSessionManager.createSession as jest.Mock).mockReturnValue('session123');
      mockUserRepository.updateLastLogin.mockResolvedValue();

      await login.execute(loginData, tenantId);

      expect(mockSessionManager.createSession).toHaveBeenCalledWith(
        managerUser.id,
        managerUser.tenantId,
        ['user.create', 'user.read', 'user.update']
      );
    });

    it('should assign correct permissions for cashier role', async () => {
      const cashierUser = { ...mockUser, role: 'cashier' };
      mockUserRepository.validateCredentials.mockResolvedValue(cashierUser);
      (mockSessionManager.createSession as jest.Mock).mockReturnValue('session123');
      mockUserRepository.updateLastLogin.mockResolvedValue();

      await login.execute(loginData, tenantId);

      expect(mockSessionManager.createSession).toHaveBeenCalledWith(
        cashierUser.id,
        cashierUser.tenantId,
        ['user.read']
      );
    });

    it('should assign default permissions for unknown role', async () => {
      const unknownUser = { ...mockUser, role: 'unknown' };
      mockUserRepository.validateCredentials.mockResolvedValue(unknownUser);
      (mockSessionManager.createSession as jest.Mock).mockReturnValue('session123');
      mockUserRepository.updateLastLogin.mockResolvedValue();

      await login.execute(loginData, tenantId);

      expect(mockSessionManager.createSession).toHaveBeenCalledWith(
        unknownUser.id,
        unknownUser.tenantId,
        ['user.read']
      );
    });
  });
}); 