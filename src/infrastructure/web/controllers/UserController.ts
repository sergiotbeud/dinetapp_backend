import { Request, Response } from 'express';
import { UserService } from '../../../application/services/UserService';
import { CreateUserDto } from '../../../application/dtos/CreateUserDto';
import { UserValidationError, UserDuplicateError, UnauthorizedError } from '../../../domain/entities/User';
import { AuthenticatedRequest } from '../../../interfaces/middleware/resolveTenant';

export class UserController {
  constructor(private userService: UserService) {}

  /**
   * @swagger
   * /api/users:
   *   post:
   *     summary: Crear un nuevo usuario
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - id
   *               - name
   *               - nickname
   *               - phone
   *               - email
   *               - role
   *             properties:
   *               id:
   *                 type: string
   *                 description: ID único del usuario
   *               name:
   *                 type: string
   *                 description: Nombre completo del usuario
   *               nickname:
   *                 type: string
   *                 description: Apodo del usuario
   *               phone:
   *                 type: string
   *                 description: Número de teléfono
   *               email:
   *                 type: string
   *                 format: email
   *                 description: Correo electrónico del usuario
   *               role:
   *                 type: string
   *                 description: Rol del usuario (admin, user, etc.)
   *     responses:
   *       201:
   *         description: Usuario creado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   *                 data:
   *                   type: object
   *       400:
   *         description: Error de validación
   *       409:
   *         description: Usuario duplicado
   *       403:
   *         description: No autorizado
   */
  async createUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userData: CreateUserDto = req.body;
      const tenantId = req.headers['x-tenant-id'] as string || req.user?.tenantId;
      const userPermissions = req.user?.permissions || [];

      if (!tenantId) {
        res.status(400).json({
          success: false,
          error: 'Tenant ID is required',
          message: 'Tenant ID must be provided in headers or authentication token'
        });
        return;
      }

      const createdUser = await this.userService.createUser(userData, tenantId, userPermissions);

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: {
          id: createdUser.id,
          name: createdUser.name,
          nickname: createdUser.nickname,
          phone: createdUser.phone,
          email: createdUser.email,
          role: createdUser.role,
          createdAt: createdUser.createdAt,
          active: createdUser.active,
          tenantId: createdUser.tenantId
        }
      });
    } catch (error) {
      if (error instanceof UserValidationError) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: error.message
        });
      } else if (error instanceof UserDuplicateError) {
        res.status(409).json({
          success: false,
          error: 'Duplicate Error',
          message: error.message
        });
      } else if (error instanceof UnauthorizedError) {
        res.status(403).json({
          success: false,
          error: 'Unauthorized',
          message: error.message
        });
      } else {
        console.error('Error creating user:', error);
        res.status(500).json({
          success: false,
          error: 'Internal Server Error',
          message: 'An unexpected error occurred while creating the user'
        });
      }
    }
  }

  /**
   * @swagger
   * /api/users:
   *   get:
   *     summary: Buscar usuarios con filtros
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: id
   *         schema:
   *           type: string
   *         description: ID exacto del usuario
   *       - in: query
   *         name: name
   *         schema:
   *           type: string
   *         description: Nombre parcial o completo del usuario
   *       - in: query
   *         name: email
   *         schema:
   *           type: string
   *         description: Email exacto del usuario
   *       - in: query
   *         name: role
   *         schema:
   *           type: string
   *         description: Rol exacto del usuario
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 1
   *         description: Número de página
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 10
   *         description: Número de resultados por página
   *     responses:
   *       200:
   *         description: Búsqueda exitosa
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   *                 data:
   *                   type: object
   *                   properties:
   *                     users:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: string
   *                           name:
   *                             type: string
   *                           nickname:
   *                             type: string
   *                           phone:
   *                             type: string
   *                           email:
   *                             type: string
   *                           role:
   *                             type: string
   *                           createdAt:
   *                             type: string
   *                             format: date-time
   *                           active:
   *                             type: boolean
   *                           tenantId:
   *                             type: string
   *                     total:
   *                       type: integer
   *                     page:
   *                       type: integer
   *                     limit:
   *                       type: integer
   *                     totalPages:
   *                       type: integer
   *       400:
   *         description: Error de validación o Tenant ID faltante
   *       403:
   *         description: No autorizado
   */
  async searchUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const searchParams = req.query;
      const tenantId = req.headers['x-tenant-id'] as string || req.user?.tenantId;
      const userPermissions = req.user?.permissions || [];

      if (!tenantId) {
        res.status(400).json({
          success: false,
          error: 'Tenant ID is required',
          message: 'Tenant ID must be provided in headers or authentication token'
        });
        return;
      }

      // Check if user has read permission
      if (!userPermissions.includes('user.read')) {
        res.status(403).json({
          success: false,
          error: 'Unauthorized',
          message: 'User does not have permission to read users'
        });
        return;
      }

      const result = await this.userService.searchUsers(searchParams, tenantId, userPermissions);

      res.status(200).json({
        success: true,
        message: result.users.length > 0 ? 'Users found successfully' : 'No users found',
        data: result
      });
    } catch (error) {
      if (error instanceof UserValidationError) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: error.message
        });
      } else if (error instanceof UnauthorizedError) {
        res.status(403).json({
          success: false,
          error: 'Unauthorized',
          message: error.message
        });
      } else {
        console.error('Error searching users:', error);
        res.status(500).json({
          success: false,
          error: 'Internal Server Error',
          message: 'An unexpected error occurred while searching users'
        });
      }
    }
  }

  /**
   * @swagger
   * /api/users/{id}:
   *   get:
   *     summary: Obtener usuario por ID
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID del usuario
   *     responses:
   *       200:
   *         description: Usuario encontrado
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: object
   *       404:
   *         description: Usuario no encontrado
   *       400:
   *         description: ID faltante o Tenant ID faltante
   */
  async getUserById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.headers['x-tenant-id'] as string || req.user?.tenantId;

      if (!tenantId) {
        res.status(400).json({
          success: false,
          error: 'Tenant ID is required',
          message: 'Tenant ID must be provided in headers or authentication token'
        });
        return;
      }

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'User ID is required',
          message: 'User ID must be provided in the URL'
        });
        return;
      }

      const user = await this.userService.getUserById(id, tenantId);

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User Not Found',
          message: `User with ID ${id} not found`
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Error getting user:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'An unexpected error occurred while retrieving the user'
      });
    }
  }
} 