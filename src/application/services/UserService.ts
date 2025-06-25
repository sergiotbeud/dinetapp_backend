import { User, UserRepository } from '../../domain/entities/User';
import { CreateUserUseCase } from '../use-cases/CreateUser';

export class UserService {
  constructor(
    private userRepository: UserRepository,
    private createUserUseCase: CreateUserUseCase
  ) {}

  async createUser(data: any, tenantId: string, userPermissions: string[]): Promise<User> {
    return this.createUserUseCase.execute(data, tenantId, userPermissions);
  }

  async getUserById(id: string, tenantId: string): Promise<User | null> {
    return this.userRepository.findById(id, tenantId);
  }

  async getUserByEmail(email: string, tenantId: string): Promise<User | null> {
    return this.userRepository.findByEmail(email, tenantId);
  }

  async getUsersByRole(role: string, tenantId: string): Promise<User[]> {
    return this.userRepository.findByRole(role, tenantId);
  }
} 