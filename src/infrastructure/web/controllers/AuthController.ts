import { Request, Response } from 'express';
import { LoginUseCase } from '../../../application/use-cases/Login';
import { LogoutUseCase } from '../../../application/use-cases/Logout';
import { AuthenticationError } from '../../../domain/entities/User';

export class AuthController {
  constructor(
    private loginUseCase: LoginUseCase,
    private logoutUseCase: LogoutUseCase
  ) {}

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const tenantId = req.headers['x-tenant-id'] as string;

      if (!tenantId) {
        res.status(400).json({
          success: false,
          error: 'Tenant ID is required',
          message: 'Tenant ID must be provided in headers'
        });
        return;
      }

      const result = await this.loginUseCase.execute({ email, password }, tenantId);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      if (error instanceof AuthenticationError) {
        res.status(401).json({
          success: false,
          error: 'Authentication Error',
          message: error.message
        });
      } else {
        console.error('Error during login:', error);
        res.status(500).json({
          success: false,
          error: 'Internal Server Error',
          message: 'An unexpected error occurred during login'
        });
      }
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = req.headers['x-session-id'] as string;

      if (!sessionId) {
        res.status(400).json({
          success: false,
          error: 'Session ID is required',
          message: 'Session ID must be provided in headers'
        });
        return;
      }

      const deleted = await this.logoutUseCase.execute(sessionId);

      res.status(200).json({
        success: true,
        message: 'Logout successful',
        data: { deleted }
      });
    } catch (error) {
      console.error('Error during logout:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'An unexpected error occurred during logout'
      });
    }
  }
} 