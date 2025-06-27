import { SessionManager } from '../../infrastructure/session/SessionManager';

export interface LogoutUseCase {
  execute(sessionId: string): Promise<boolean>;
}

export class Logout implements LogoutUseCase {
  constructor(private sessionManager: SessionManager) {}

  async execute(sessionId: string): Promise<boolean> {
    if (!sessionId) {
      return false;
    }

    return this.sessionManager.deleteSession(sessionId);
  }
} 