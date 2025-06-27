import 'jest';
import { UpdateUser } from '../../../src/application/use-cases/UpdateUser';
import { UserRepository, User, UserValidationError, UserDuplicateError, UnauthorizedError, UserNotFoundError } from '../../../src/domain/entities/User';
import { UpdateUserDto } from '../../../src/application/dtos/UpdateUserDto';

const makeUser = (overrides = {}): User => ({
  id: 'user1',
  name: 'John Doe',
  nickname: 'johnny',
  phone: '+123456789',
  email: 'john@example.com',
  role: 'manager',
  password: 'password123',
  createdAt: new Date(),
  active: true,
  tenantId: 'tenant1',
  ...overrides,
});

describe('UpdateUser Use Case', () => {
  let userRepository: jest.Mocked<UserRepository>;
  let updateUser: UpdateUser;
  const tenantId = 'tenant1';
  const userPermissions = ['user.update'];

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      updateUser: jest.fn(),
      create: jest.fn(),
      findByRole: jest.fn(),
      searchUsers: jest.fn(),
      deleteUser: jest.fn(),
      validateCredentials: jest.fn(),
      updateLastLogin: jest.fn(),
    } as any;
    updateUser = new UpdateUser(userRepository);
  });

  it('actualiza exitosamente todos los campos', async () => {
    const existing = makeUser();
    const updates: UpdateUserDto = { name: 'Jane', email: 'jane@example.com', role: 'admin', phone: '+987654321', nickname: 'jane' };
    userRepository.findById.mockResolvedValue(existing);
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.updateUser.mockResolvedValue({ ...existing, ...updates });

    const result = await updateUser.execute('user1', updates, tenantId, userPermissions);
    expect(result.name).toBe('Jane');
    expect(result.email).toBe('jane@example.com');
    expect(result.role).toBe('admin');
    expect(userRepository.updateUser).toHaveBeenCalledWith('user1', tenantId, updates);
  });

  it('actualiza parcialmente solo algunos campos', async () => {
    const existing = makeUser();
    const updates: UpdateUserDto = { name: 'Jane' };
    userRepository.findById.mockResolvedValue(existing);
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.updateUser.mockResolvedValue({ ...existing, ...updates });

    const result = await updateUser.execute('user1', updates, tenantId, userPermissions);
    expect(result.name).toBe('Jane');
    expect(result.email).toBe(existing.email);
  });

  it('lanza error si no tiene permisos', async () => {
    await expect(updateUser.execute('user1', { name: 'Jane' }, tenantId, []))
      .rejects.toThrow(UnauthorizedError);
  });

  it('lanza error si el usuario no existe', async () => {
    userRepository.findById.mockResolvedValue(null);
    await expect(updateUser.execute('user1', { name: 'Jane' }, tenantId, userPermissions))
      .rejects.toThrow(UserNotFoundError);
  });

  it('lanza error si el email ya está en uso por otro usuario', async () => {
    const existing = makeUser();
    const otherUser = makeUser({ id: 'user2', email: 'jane@example.com' });
    userRepository.findById.mockResolvedValue(existing);
    userRepository.findByEmail.mockResolvedValue(otherUser);
    await expect(updateUser.execute('user1', { email: 'jane@example.com' }, tenantId, userPermissions))
      .rejects.toThrow(UserDuplicateError);
  });

  it('lanza error de validación si los datos son inválidos', async () => {
    const existing = makeUser();
    userRepository.findById.mockResolvedValue(existing);
    await expect(updateUser.execute('user1', { email: 'no-es-email' }, tenantId, userPermissions))
      .rejects.toThrow(UserValidationError);
  });

  it('lanza error si no se envía ningún campo', async () => {
    const existing = makeUser();
    userRepository.findById.mockResolvedValue(existing);
    await expect(updateUser.execute('user1', {}, tenantId, userPermissions))
      .rejects.toThrow(UserValidationError);
  });
}); 