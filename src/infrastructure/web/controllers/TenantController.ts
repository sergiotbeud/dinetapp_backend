import { Request, Response } from 'express';
import { TenantService } from '../../../application/services/TenantService';
import { CreateTenant } from '../../../application/use-cases/CreateTenant';
import { CreateTenantDto, UpdateTenantDto } from '../../../domain/entities/Tenant';
import { SearchTenants } from '../../../application/use-cases/SearchTenants';

export class TenantController {
  constructor(
    private tenantService: TenantService,
    private createTenantUseCase: CreateTenant,
    private searchTenantsUseCase: SearchTenants
  ) {}

  async createTenant(req: Request, res: Response): Promise<void> {
    try {
      const tenantData: CreateTenantDto = req.body;
      const tenant = await this.createTenantUseCase.execute(tenantData);
      res.status(201).json({
        success: true,
        message: 'Tenant created successfully',
        data: tenant
      });
    } catch (error) {
      console.error('Error creating tenant:', error);
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal Server Error',
          message: 'An unexpected error occurred while creating the tenant'
        });
      }
    }
  }

  async getTenantById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Tenant ID is required',
          message: 'Tenant ID must be provided in the URL'
        });
        return;
      }
      
      const tenant = await this.tenantService.getTenantById(id);
      if (!tenant) {
        res.status(404).json({
          success: false,
          error: 'Tenant Not Found',
          message: `Tenant with ID ${id} not found`
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: tenant
      });
    } catch (error) {
      console.error('Error getting tenant:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'An unexpected error occurred while retrieving the tenant'
      });
    }
  }

  async updateTenant(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tenantData: UpdateTenantDto = req.body;
      
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Tenant ID is required',
          message: 'Tenant ID must be provided in the URL'
        });
        return;
      }
      
      const updatedTenant = await this.tenantService.updateTenant(id, tenantData);
      
      res.status(200).json({
        success: true,
        message: 'Tenant updated successfully',
        data: updatedTenant
      });
    } catch (error) {
      console.error('Error updating tenant:', error);
      
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal Server Error',
          message: 'An unexpected error occurred while updating the tenant'
        });
      }
    }
  }

  async deleteTenant(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Tenant ID is required',
          message: 'Tenant ID must be provided in the URL'
        });
        return;
      }
      
      const deleted = await this.tenantService.deleteTenant(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Tenant Not Found',
          message: `Tenant with ID ${id} not found`
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Tenant deleted successfully',
        data: { deleted: true }
      });
    } catch (error) {
      console.error('Error deleting tenant:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          res.status(404).json({
            success: false,
            error: 'Tenant Not Found',
            message: error.message
          });
        } else {
          res.status(400).json({
            success: false,
            error: 'Validation Error',
            message: error.message
          });
        }
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal Server Error',
          message: 'An unexpected error occurred while deleting the tenant'
        });
      }
    }
  }

  async listTenants(req: Request, res: Response): Promise<void> {
    try {
      const tenants = await this.tenantService.listTenants();
      
      res.status(200).json({
        success: true,
        data: {
          tenants,
          total: tenants.length
        }
      });
    } catch (error) {
      console.error('Error listing tenants:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'An unexpected error occurred while listing tenants'
      });
    }
  }

  async activateTenant(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Tenant ID is required',
          message: 'Tenant ID must be provided in the URL'
        });
        return;
      }
      
      const tenant = await this.tenantService.activateTenant(id);
      
      res.status(200).json({
        success: true,
        message: 'Tenant activated successfully',
        data: tenant
      });
    } catch (error) {
      console.error('Error activating tenant:', error);
      
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal Server Error',
          message: 'An unexpected error occurred while activating the tenant'
        });
      }
    }
  }

  async suspendTenant(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Tenant ID is required',
          message: 'Tenant ID must be provided in the URL'
        });
        return;
      }
      
      const tenant = await this.tenantService.suspendTenant(id);
      
      res.status(200).json({
        success: true,
        message: 'Tenant suspended successfully',
        data: tenant
      });
    } catch (error) {
      console.error('Error suspending tenant:', error);
      
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal Server Error',
          message: 'An unexpected error occurred while suspending the tenant'
        });
      }
    }
  }

  async search(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        ...req.query,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10
      };
      const result = await this.searchTenantsUseCase.execute(filters);
      res.status(200).json({
        success: true,
        message: 'Tenants retrieved successfully',
        data: result
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
} 