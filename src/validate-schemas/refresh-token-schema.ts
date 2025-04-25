import Joi from 'joi';

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': 'Refresh Token là bắt buộc',
    'string.empty': 'Refresh Token không được để trống'
  })
});
