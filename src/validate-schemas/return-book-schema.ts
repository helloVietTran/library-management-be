import Joi from 'joi';

export const returnBookSchema = Joi.object({
  status: Joi.string().valid('ok', 'break', 'lost').required().messages({
    'any.only': "Trạng thái sách phải là 'ok', 'break' hoặc 'lost'.",
    'any.required': 'Trường trạng thái là bắt buộc.'
  }),
  note: Joi.string().allow('').optional()
});
