import { Request, Response } from 'express';
import { UserService } from '../../../application/services/UserService';
import { CreateUserDto } from '../../../application/dtos/CreateUserDto';
import { UpdateUserDto } from '../../../application/dtos/UpdateUserDto';
import { DeleteUserDto } from '../../../application/dtos/DeleteUserDto';
import { UserValidationError, UserDuplicateError, UnauthorizedError, UserNotFoundError } from '../../../domain/entities/User';
import { AuthenticatedRequest } from '../../../interfaces/middleware/authenticate';

export class UserController {
  constructor(private userService: UserService) {}

  async createUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userData: CreateUserDto = req.body;
      const tenantId = req.user?.tenantId;
      const userPermissions = req.user?.permissions || [];
      
      if (!tenantId) {
        res.status(400).json({
          success: false,
          error: 'Tenant ID is required',
          message: 'Tenant ID must be provided in authentication'
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

  async searchUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const searchParams = req.query;
      const tenantId = req.user?.tenantId;
      const userPermissions = req.user?.permissions || [];
      
      if (!tenantId) {
        res.status(400).json({
          success: false,
          error: 'Tenant ID is required',
          message: 'Tenant ID must be provided in authentication'
        });
        return;
      }
      
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

  async updateUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userData: UpdateUserDto = req.body;
      const tenantId = req.user?.tenantId;
      const userPermissions = req.user?.permissions || [];
      
      if (!tenantId) {
        res.status(400).json({
          success: false,
          error: 'Tenant ID is required',
          message: 'Tenant ID must be provided in authentication'
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
      
      const updatedUser = await this.userService.updateUser(id, userData, tenantId, userPermissions);
      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: {
          id: updatedUser.id,
          name: updatedUser.name,
          nickname: updatedUser.nickname,
          phone: updatedUser.phone,
          email: updatedUser.email,
          role: updatedUser.role,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt,
          active: updatedUser.active,
          tenantId: updatedUser.tenantId
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
      } else if (error instanceof UserNotFoundError) {
        res.status(404).json({
          success: false,
          error: 'User Not Found',
          message: error.message
        });
      } else if (error instanceof UnauthorizedError) {
        res.status(403).json({
          success: false,
          error: 'Unauthorized',
          message: error.message
        });
      } else {
        console.error('Error updating user:', error);
        res.status(500).json({
          success: false,
          error: 'Internal Server Error',
          message: 'An unexpected error occurred while updating the user'
        });
      }
    }
  }

  async deleteUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userData: DeleteUserDto = req.body;
      const tenantId = req.user?.tenantId;
      const userPermissions = req.user?.permissions || [];
      
      if (!tenantId) {
        res.status(400).json({
          success: false,
          error: 'Tenant ID is required',
          message: 'Tenant ID must be provided in authentication'
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
      
      const deleted = await this.userService.deleteUser(id, userData, tenantId, userPermissions);
      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
        data: { deleted }
      });
    } catch (error) {
      if (error instanceof UserValidationError) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: error.message
        });
      } else if (error instanceof UserNotFoundError) {
        res.status(404).json({
          success: false,
          error: 'User Not Found',
          message: error.message
        });
      } else if (error instanceof UnauthorizedError) {
        res.status(403).json({
          success: false,
          error: 'Unauthorized',
          message: error.message
        });
      } else {
        console.error('Error deleting user:', error);
        res.status(500).json({
          success: false,
          error: 'Internal Server Error',
          message: 'An unexpected error occurred while deleting the user'
        });
      }
    }
  }

  async getUserById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;
      
      if (!tenantId) {
        res.status(400).json({
          success: false,
          error: 'Tenant ID is required',
          message: 'Tenant ID must be provided in authentication'
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