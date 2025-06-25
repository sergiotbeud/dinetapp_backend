import { Router } from 'express';
import { UserController } from '../../../infrastructure/web/controllers/UserController';
import { UserService } from '../../../application/services/UserService';
import { CreateUser } from '../../../application/use-cases/CreateUser';
import { SearchUsers } from '../../../application/use-cases/SearchUsers';
import { MySQLUserRepository } from '../../../infrastructure/db/mysql/UserRepository';
import { DatabaseConnection } from '../../../infrastructure/db/mysql/DatabaseConnection';
import { mockAuthMiddleware, resolveTenant } from '../../middleware/resolveTenant';

const router = Router();

// Inicializar dependencias
const dbConnection = new DatabaseConnection();
const userRepository = new MySQLUserRepository(dbConnection);
const createUserUseCase = new CreateUser(userRepository);
const searchUsersUseCase = new SearchUsers(userRepository);
const userService = new UserService(userRepository, createUserUseCase, searchUsersUseCase);
const userController = new UserController(userService);

// Middleware de autenticación y resolución de tenant
router.use(mockAuthMiddleware);
router.use(resolveTenant);

// Rutas
router.post('/', (req, res) => userController.createUser(req, res));
router.get('/', (req, res) => userController.searchUsers(req, res));
router.get('/:id', (req, res) => userController.getUserById(req, res));

export default router; 