import { User, UserRepository, UserValidationError, UserDuplicateError, UnauthorizedError, UserNotFoundError } from '../../domain/entities/User';
import { UpdateUserDto, validateUpdateUserDto } from '../dtos/UpdateUserDto';

export interface UpdateUserUseCase {
  execute(id: string, data: UpdateUserDto, tenantId: string, userPermissions: string[]): Promise<User>;
}

export class UpdateUser implements UpdateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(id: string, data: UpdateUserDto, tenantId: string, userPermissions: string[]): Promise<User> {
    if (!userPermissions.includes('user.update')) {
      throw new UnauthorizedError('User does not have permission to update users');
    }
    const existingUser = await this.userRepository.findById(id, tenantId);
    if (!existingUser) {
      throw new UserNotFoundError(`User with ID ${id} not found`);
    }
    let validatedData: UpdateUserDto;
    try {
      validatedData = validateUpdateUserDto(data);
    } catch (error) {
      throw new UserValidationError(error instanceof Error ? error.message : 'Validation failed');
    }
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const userWithSameEmail = await this.userRepository.findByEmail(validatedData.email, tenantId);
      if (userWithSameEmail && userWithSameEmail.id !== id) {
        throw new UserDuplicateError(`User with email ${validatedData.email} already exists`);
      }
    }
    const updatedUser = await this.userRepository.updateUser(id, tenantId, validatedData);
    return updatedUser;
  }
} 