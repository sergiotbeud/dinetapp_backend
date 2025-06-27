import Joi from 'joi';

export interface CreateUserDto {
  id: string;
  name: string;
  nickname: string;
  phone: string;
  email: string;
  role: string;
  password: string;
}

export const createUserSchema = Joi.object({
  id: Joi.string().required().min(1).max(50).messages({
    'string.empty': 'ID is required',
    'string.min': 'ID must be at least 1 character long',
    'string.max': 'ID must not exceed 50 characters',
  }),
  name: Joi.string().required().min(2).max(100).messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name must not exceed 100 characters',
  }),
  nickname: Joi.string().required().min(2).max(50).messages({
    'string.empty': 'Nickname is required',
    'string.min': 'Nickname must be at least 2 characters long',
    'string.max': 'Nickname must not exceed 50 characters',
  }),
  phone: Joi.string().required().pattern(/^\+?[\d\s\-\(\)]+$/).messages({
    'string.empty': 'Phone is required',
    'string.pattern.base': 'Phone must be a valid phone number',
  }),
  email: Joi.string().required().email().max(255).messages({
    'string.empty': 'Email is required',
    'string.email': 'Email must be a valid email address',
    'string.max': 'Email must not exceed 255 characters',
  }),
  role: Joi.string().required().valid('admin', 'manager', 'cashier', 'viewer').messages({
    'string.empty': 'Role is required',
    'any.only': 'Role must be one of: admin, manager, cashier, viewer',
  }),
  password: Joi.string().required().min(6).max(255).messages({
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 6 characters long',
    'string.max': 'Password must not exceed 255 characters',
  }),
});

export const validateCreateUserDto = (data: any): CreateUserDto => {
  const { error, value } = createUserSchema.validate(data, { abortEarly: false });
  
  if (error) {
    const errorMessages = error.details.map(detail => detail.message).join(', ');
    throw new Error(`Validation error: ${errorMessages}`);
  }
  
  return value;
}; 