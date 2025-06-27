import { Request, Response, NextFunction } from 'express';
import { sessionManager } from '../../infrastructure/session/SessionManager';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    tenantId: string;
    permissions: string[];
  };
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const sessionId = req.headers['x-session-id'] as string;
  const headerTenantId = req.headers['x-tenant-id'] as string;
  const headerPermissions = req.headers['x-user-permissions'] as string;

  // Si no hay sessionId pero hay headers de test, usar modo test
  if (!sessionId && headerTenantId && headerPermissions) {
    req.user = {
      id: 'test-user',
      tenantId: headerTenantId,
      permissions: headerPermissions.split(',').map(p => p.trim())
    };
    next();
    return;
  }

  // Si hay sessionId, usar autenticación normal
  if (sessionId) {
    const session = sessionManager.getSession(sessionId);
    if (!session) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid or expired session'
      });
      return;
    }

    req.user = {
      id: session.userId,
      tenantId: session.tenantId,
      permissions: session.permissions
    };
    next();
    return;
  }

  // Si no hay sessionId ni headers de test, rechazar
  res.status(401).json({
    success: false,
    error: 'Unauthorized',
    message: 'Session ID is required'
  });
}; 