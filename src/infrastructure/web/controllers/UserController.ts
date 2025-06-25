import { Request, Response } from 'express';
import { UserService } from '../../../application/services/UserService';
import { CreateUserDto } from '../../../application/dtos/CreateUserDto';
import { UserValidationError, UserDuplicateError, UnauthorizedError } from '../../../domain/entities/User';
import { AuthenticatedRequest } from '../../../interfaces/middleware/resolveTenant';

export class UserController {
  constructor(private userService: UserService) {}

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