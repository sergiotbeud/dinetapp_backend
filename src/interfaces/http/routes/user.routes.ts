import { Router } from 'express';
import { UserController } from '../../../infrastructure/web/controllers/UserController';
import { UserService } from '../../../application/services/UserService';
import { CreateUser } from '../../../application/use-cases/CreateUser';
import { SearchUsers } from '../../../application/use-cases/SearchUsers';
import { UpdateUser } from '../../../application/use-cases/UpdateUser';
import { DeleteUser } from '../../../application/use-cases/DeleteUser';
import { MySQLUserRepository } from '../../../infrastructure/db/mysql/UserRepository';
import { DatabaseConnection } from '../../../infrastructure/db/mysql/DatabaseConnection';
import { authenticate } from '../../middleware/authenticate';
import { resolveTenant } from '../../middleware/resolveTenant';

const router = Router();

const dbConnection = new DatabaseConnection();
const userRepository = new MySQLUserRepository(dbConnection);
const createUserUseCase = new CreateUser(userRepository);
const searchUsersUseCase = new SearchUsers(userRepository);
const updateUserUseCase = new UpdateUser(userRepository);
const deleteUserUseCase = new DeleteUser(userRepository);
const userService = new UserService(userRepository, createUserUseCase, searchUsersUseCase, updateUserUseCase, deleteUserUseCase);
const userController = new UserController(userService);

router.use(authenticate);
router.use(resolveTenant);

router.post('/', (req, res) => userController.createUser(req, res));
router.get('/', (req, res) => userController.searchUsers(req, res));
router.get('/:id', (req, res) => userController.getUserById(req, res));
router.put('/:id', (req, res) => userController.updateUser(req, res));
router.delete('/:id', (req, res) => userController.deleteUser(req, res));

export default router; 