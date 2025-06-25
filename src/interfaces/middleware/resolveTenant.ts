import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    tenantId: string;
    permissions: string[];
  };
  tenantId?: string;
}

export const resolveTenant = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  // 1. Intentar obtener tenantId del header
  const headerTenantId = req.headers['x-tenant-id'] as string;
  
  // 2. Si no hay header, intentar obtener del token JWT (simulado)
  const tokenTenantId = req.user?.tenantId;
  
  // 3. Usar el tenantId disponible
  const tenantId = headerTenantId || tokenTenantId;
  
  if (!tenantId) {
    res.status(400).json({
      success: false,
      error: 'Tenant ID Required',
      message: 'Tenant ID must be provided in X-Tenant-ID header or authentication token'
    });
    return;
  }
  
  // Agregar tenantId a la request para uso posterior
  req.tenantId = tenantId;
  next();
};

export const mockAuthMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  // Middleware simulado para pruebas - en producción usar JWT real
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Valid authentication token is required'
    });
    return;
  }
  
  // Simular usuario autenticado con permisos
  req.user = {
    id: 'mock-user-id',
    email: 'admin@example.com',
    tenantId: req.headers['x-tenant-id'] as string || 'default',
    permissions: ['user.create', 'user.read', 'user.update', 'user.delete']
  };
  
  next();
}; 