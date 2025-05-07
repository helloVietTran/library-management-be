import Joi from 'joi';

export const createConversationSchema = Joi.object({
  recipientId: Joi.string().required().messages({
    'string.base': 'ID không được để trống',
    'any.required': 'ID là bắt buộc'
  })
});