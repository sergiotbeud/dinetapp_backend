export interface Session {
  id: string;
  userId: string;
  tenantId: string;
  permissions: string[];
  createdAt: Date;
  expiresAt: Date;
}

export class SessionManager {
  private sessions = new Map<string, Session>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredSessions();
    }, 5 * 60 * 1000);
  }

  createSession(userId: string, tenantId: string, permissions: string[]): string {
    const sessionId = this.generateSessionId();
    const session: Session = {
      id: sessionId,
      userId,
      tenantId,
      permissions,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };
    this.sessions.set(sessionId, session);
    return sessionId;
  }

  getSession(sessionId: string): Session | null {
    const session = this.sessions.get(sessionId);
    if (!session || session.expiresAt < new Date()) {
      this.sessions.delete(sessionId);
      return null;
    }
    return session;
  }

  deleteSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  private generateSessionId(): string {
    return crypto.randomUUID();
  }

  private cleanupExpiredSessions(): void {
    const now = new Date();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.expiresAt < now) {
        this.sessions.delete(sessionId);
      }
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

// Instancia compartida
export const sessionManager = new SessionManager();