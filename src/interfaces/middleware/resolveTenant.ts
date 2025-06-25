import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    tenantId?: string;
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
      error: 'Tenant ID is required',
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
  
  // Obtener permisos del header x-user-permissions si está presente
  let permissions: string[] = ['user.create', 'user.read', 'user.update', 'user.delete'];
  const permissionsHeader = req.headers['x-user-permissions'];
  if (permissionsHeader && typeof permissionsHeader === 'string') {
    permissions = permissionsHeader.split(',').map(p => p.trim());
  }
  
  // Simular usuario autenticado con permisos
  const user: any = {
    id: 'mock-user-id',
    email: 'admin@example.com',
    permissions
  };
  
  // Solo agregar tenantId si está presente en el header
  const headerTenantId = req.headers['x-tenant-id'] as string;
  if (headerTenantId) {
    user.tenantId = headerTenantId;
  }
  
  req.user = user;
  
  next();
}; 