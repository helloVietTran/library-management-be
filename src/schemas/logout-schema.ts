import Joi from 'joi';

export const logoutSchema = Joi.object({
  accessToken: Joi.string().required().messages({
    'any.required': 'Access token là bắt buộc',
    'string.empty': 'Access token không được để trống'
  })
});
