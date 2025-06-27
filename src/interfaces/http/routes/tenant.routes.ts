import { Router } from 'express';
import { TenantController } from '../../../infrastructure/web/controllers/TenantController';
import { TenantService } from '../../../application/services/TenantService';
import { CreateTenant } from '../../../application/use-cases/CreateTenant';
import { SearchTenants } from '../../../application/use-cases/SearchTenants';
import { MySQLTenantRepository } from '../../../infrastructure/db/mysql/TenantRepository';
import { DatabaseConnection } from '../../../infrastructure/db/mysql/DatabaseConnection';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

const dbConnection = new DatabaseConnection();
const tenantRepository = new MySQLTenantRepository(dbConnection);
const createTenantUseCase = new CreateTenant(tenantRepository);
const searchTenantsUseCase = new SearchTenants(tenantRepository);
const tenantService = new TenantService(tenantRepository);
const tenantController = new TenantController(tenantService, createTenantUseCase, searchTenantsUseCase);

// Rutas públicas (sin autenticación para crear tenants)
router.post('/', (req, res) => tenantController.createTenant(req, res));
router.get('/:id', (req, res) => tenantController.getTenantById(req, res));

// Rutas administrativas (requieren autenticación)
router.get('/', authenticate, (req, res) => tenantController.search(req, res)); // Búsqueda con filtros y paginación
router.get('/list/all', authenticate, (req, res) => tenantController.listTenants(req, res)); // Lista simple
router.put('/:id', authenticate, (req, res) => tenantController.updateTenant(req, res));
router.delete('/:id', authenticate, (req, res) => tenantController.deleteTenant(req, res));
router.post('/:id/activate', authenticate, (req, res) => tenantController.activateTenant(req, res));
router.post('/:id/suspend', authenticate, (req, res) => tenantController.suspendTenant(req, res));

export default router; 