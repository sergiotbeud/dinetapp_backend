import Joi from 'joi';

export interface SearchTenantFilters {
  name?: string;
  ownerEmail?: string;
  status?: 'active' | 'suspended' | 'cancelled';
  subscriptionPlan?: string;
  page: number;
  limit: number;
}

export const searchTenantSchema = Joi.object({
  name: Joi.string().optional().min(1).max(100).messages({
    'string.min': 'Name filter must be at least 1 character long',
    'string.max': 'Name filter must not exceed 100 characters',
  }),
  ownerEmail: Joi.string().optional().email().max(255).messages({
    'string.email': 'Owner email filter must be a valid email address',
    'string.max': 'Owner email filter must not exceed 255 characters',
  }),
  status: Joi.string().optional().valid('active', 'suspended', 'cancelled').messages({
    'any.only': 'Status must be one of: active, suspended, cancelled',
  }),
  subscriptionPlan: Joi.string().optional().min(1).max(50).messages({
    'string.min': 'Subscription plan filter must be at least 1 character long',
    'string.max': 'Subscription plan filter must not exceed 50 characters',
  }),
  page: Joi.number().integer().min(1).default(1).messages({
    'number.base': 'Page must be a number',
    'number.integer': 'Page must be an integer',
    'number.min': 'Page must be at least 1',
  }),
  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    'number.base': 'Limit must be a number',
    'number.integer': 'Limit must be an integer',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit must not exceed 100',
  }),
});

export const validateSearchTenantDto = (data: any): SearchTenantFilters => {
  const { error, value } = searchTenantSchema.validate(data, { abortEarly: false });
  
  if (error) {
    const errorMessages = error.details.map(detail => detail.message).join(', ');
    throw new Error(`Validation error: ${errorMessages}`);
  }
  
  return value;
}; 