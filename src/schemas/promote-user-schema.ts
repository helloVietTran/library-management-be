import Joi from 'joi';

export const promoteUserSchema = Joi.object({
  newRole: Joi.string().valid('librarian', 'admin', 'user').required().messages({
    'any.only': "Role must be either 'librarian' or 'admin' or 'user'",
    'string.base': 'Role must be a string',
    'any.required': 'Role is required'
  })
});
