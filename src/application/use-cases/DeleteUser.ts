import { User, UserRepository, UserValidationError, UnauthorizedError, UserNotFoundError } from '../../domain/entities/User';
import { DeleteUserDto, validateDeleteUserDto } from '../dtos/DeleteUserDto';

export interface DeleteUserUseCase {
  execute(id: string, data: DeleteUserDto, tenantId: string, userPermissions: string[]): Promise<boolean>;
}

export class DeleteUser implements DeleteUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(id: string, data: DeleteUserDto, tenantId: string, userPermissions: string[]): Promise<boolean> {
    if (!userPermissions.includes('user.delete')) {
      throw new UnauthorizedError('User does not have permission to delete users');
    }

    const existingUser = await this.userRepository.findById(id, tenantId);
    if (!existingUser) {
      throw new UserNotFoundError(`User with ID ${id} not found`);
    }

    let validatedData: DeleteUserDto;
    try {
      validatedData = validateDeleteUserDto(data);
    } catch (error) {
      throw new UserValidationError(error instanceof Error ? error.message : 'Validation failed');
    }

    const deleted = await this.userRepository.deleteUser(id, tenantId, validatedData);
    return deleted;
  }
} 