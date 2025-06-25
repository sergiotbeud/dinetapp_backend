import { User, UserRepository, SearchUserFilters, SearchUserResult } from '../../domain/entities/User';
import { CreateUserUseCase } from '../use-cases/CreateUser';
import { SearchUsers } from '../use-cases/SearchUsers';

export class UserService {
  constructor(
    private userRepository: UserRepository,
    private createUserUseCase: CreateUserUseCase,
    private searchUsersUseCase: SearchUsers
  ) {}

  async createUser(data: any, tenantId: string, userPermissions: string[]): Promise<User> {
    return this.createUserUseCase.execute(data, tenantId, userPermissions);
  }

  async searchUsers(searchParams: any, tenantId: string, userPermissions: string[]): Promise<SearchUserResult> {
    // Validate permissions
    if (!userPermissions.includes('user.read')) {
      throw new Error('User does not have permission to read users');
    }

    // Parse and validate search parameters
    const filters: SearchUserFilters = {
      tenantId,
      page: parseInt(searchParams.page) || 1,
      limit: parseInt(searchParams.limit) || 10
    };

    // Add optional filters
    if (searchParams.id) filters.id = searchParams.id;
    if (searchParams.name) filters.name = searchParams.name;
    if (searchParams.email) filters.email = searchParams.email;
    if (searchParams.role) filters.role = searchParams.role;

    return this.searchUsersUseCase.execute(filters);
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