import Joi from 'joi';

export const updateUserStatusSchema = Joi.object({
  status: Joi.string().valid('active', 'banned').required().messages({
    'any.only': "Trạng thái chỉ có thể là 'active' hoặc 'banned'",
    'any.required': 'Trạng thái là bắt buộc'
  })
});
