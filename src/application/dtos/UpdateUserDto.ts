import Joi from 'joi';

export interface UpdateUserDto {
  name?: string;
  nickname?: string;
  phone?: string;
  email?: string;
  role?: string;
}

export const updateUserSchema = Joi.object({
  name: Joi.string().optional().min(2).max(100).messages({
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name must not exceed 100 characters',
  }),
  nickname: Joi.string().optional().min(2).max(50).messages({
    'string.min': 'Nickname must be at least 2 characters long',
    'string.max': 'Nickname must not exceed 50 characters',
  }),
  phone: Joi.string().optional().pattern(/^\+?[\d\s\-\(\)]+$/).messages({
    'string.pattern.base': 'Phone must be a valid phone number',
  }),
  email: Joi.string().optional().email().max(255).messages({
    'string.email': 'Email must be a valid email address',
    'string.max': 'Email must not exceed 255 characters',
  }),
  role: Joi.string().optional().valid('admin', 'manager', 'cashier', 'viewer').messages({
    'any.only': 'Role must be one of: admin, manager, cashier, viewer',
  }),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

export const validateUpdateUserDto = (data: any): UpdateUserDto => {
  const { error, value } = updateUserSchema.validate(data, { abortEarly: false });
  
  if (error) {
    const errorMessages = error.details.map(detail => detail.message).join(', ');
    throw new Error(`Validation error: ${errorMessages}`);
  }
  
  return value;
}; 