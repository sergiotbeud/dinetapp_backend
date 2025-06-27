import Joi from 'joi';

export interface LoginDto {
  email: string;
  password: string;
}

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email must be a valid email address',
    'any.required': 'Email is required',
    'string.empty': 'Email cannot be empty'
  }),
  password: Joi.string().min(1).required().messages({
    'any.required': 'Password is required',
    'string.empty': 'Password cannot be empty',
    'string.min': 'Password cannot be empty'
  })
});

export const validateLoginDto = (data: any): LoginDto => {
  const { error, value } = loginSchema.validate(data);
  if (error) {
    throw new Error(error.details[0]?.message || 'Validation failed');
  }
  return value;
}; 