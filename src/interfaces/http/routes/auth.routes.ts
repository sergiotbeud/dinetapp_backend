import { Router } from 'express';
import { AuthController } from '../../../infrastructure/web/controllers/AuthController';
import { Login } from '../../../application/use-cases/Login';
import { Logout } from '../../../application/use-cases/Logout';
import { MySQLUserRepository } from '../../../infrastructure/db/mysql/UserRepository';
import { DatabaseConnection } from '../../../infrastructure/db/mysql/DatabaseConnection';
import { sessionManager } from '../../../infrastructure/session/SessionManager';
import { resolveTenant } from '../../middleware/resolveTenant';

const router = Router();

const dbConnection = new DatabaseConnection();
const userRepository = new MySQLUserRepository(dbConnection);
const loginUseCase = new Login(userRepository, sessionManager);
const logoutUseCase = new Logout(sessionManager);
const authController = new AuthController(loginUseCase, logoutUseCase);

router.post('/login', resolveTenant, (req, res) => authController.login(req, res));
router.post('/logout', (req, res) => authController.logout(req, res));

export default router; 