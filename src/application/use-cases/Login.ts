import { UserRepository, AuthenticationError } from '../../domain/entities/User';
import { LoginDto, validateLoginDto } from '../dtos/LoginDto';
import { SessionManager } from '../../infrastructure/session/SessionManager';
import { PasswordService } from '../services/PasswordService';

export interface LoginUseCase {
  execute(data: LoginDto, tenantId: string): Promise<{ sessionId: string; user: any }>;
}

export class Login implements LoginUseCase {
  constructor(
    private userRepository: UserRepository,
    private sessionManager: SessionManager
  ) {}

  async execute(data: LoginDto, tenantId: string): Promise<{ sessionId: string; user: any }> {
    let validatedData: LoginDto;
    try {
      validatedData = validateLoginDto(data);
    } catch (error) {
      throw new AuthenticationError(error instanceof Error ? error.message : 'Validation failed');
    }

    const user = await this.userRepository.validateCredentials(
      validatedData.email,
      validatedData.password,
      tenantId
    );

    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    if (!user.active) {
      throw new AuthenticationError('User account is inactive');
    }

    const permissions = this.getPermissionsByRole(user.role);
    const sessionId = this.sessionManager.createSession(
      user.id,
      user.tenantId,
      permissions
    );

    await this.userRepository.updateLastLogin(user.id, user.tenantId);

    return {
      sessionId,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId
      }
    };
  }

  private getPermissionsByRole(role: string): string[] {
    const permissionsMap: { [key: string]: string[] } = {
      admin: ['user.create', 'user.read', 'user.update', 'user.delete'],
      manager: ['user.create', 'user.read', 'user.update'],
      cashier: ['user.read']
    };

    return permissionsMap[role] || ['user.read'];
  }
} 