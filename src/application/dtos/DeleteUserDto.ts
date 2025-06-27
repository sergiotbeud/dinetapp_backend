import Joi from 'joi';

export interface DeleteUserDto {
  reason?: string;
}

export const deleteUserSchema = Joi.object({
  reason: Joi.string().optional().max(500).messages({
    'string.max': 'Reason must not exceed 500 characters',
  }),
});

export const validateDeleteUserDto = (data: any): DeleteUserDto => {
  const { error, value } = deleteUserSchema.validate(data);
  if (error) {
    throw new Error(error.details[0]?.message || 'Validation failed');
  }
  return value;
}; 