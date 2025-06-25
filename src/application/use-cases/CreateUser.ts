import { User, UserRepository, UserValidationError, UserDuplicateError, UnauthorizedError } from '../../domain/entities/User';
import { CreateUserDto, validateCreateUserDto } from '../dtos/CreateUserDto';

export interface CreateUserUseCase {
  execute(data: CreateUserDto, tenantId: string, userPermissions: string[]): Promise<User>;
}

export class CreateUser implements CreateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(data: CreateUserDto, tenantId: string, userPermissions: string[]): Promise<User> {
    // 1. Validar permisos
    if (!userPermissions.includes('user.create')) {
      throw new UnauthorizedError('User does not have permission to create users');
    }

    // 2. Validar datos de entrada
    let validatedData: CreateUserDto;
    try {
      validatedData = validateCreateUserDto(data);
    } catch (error) {
      throw new UserValidationError(error instanceof Error ? error.message : 'Validation failed');
    }

    // 3. Verificar unicidad de email
    const existingUserByEmail = await this.userRepository.findByEmail(validatedData.email, tenantId);
    if (existingUserByEmail) {
      throw new UserDuplicateError(`User with email ${validatedData.email} already exists`);
    }

    // 4. Verificar unicidad de ID
    const existingUserById = await this.userRepository.findById(validatedData.id, tenantId);
    if (existingUserById) {
      throw new UserDuplicateError(`User with ID ${validatedData.id} already exists`);
    }

    // 5. Crear el usuario
    const newUser: Omit<User, 'createdAt' | 'active'> = {
      id: validatedData.id,
      name: validatedData.name,
      nickname: validatedData.nickname,
      phone: validatedData.phone,
      email: validatedData.email,
      role: validatedData.role,
      tenantId,
    };

    const createdUser = await this.userRepository.create(newUser);
    return createdUser;
  }
} 