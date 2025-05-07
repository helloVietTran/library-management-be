import Joi from 'joi';

export const sendMessageSchema = Joi.object({
  recipientId: Joi.string().required().label('Recipient ID').messages({
    'any.required': 'Vui lòng cung cấp người nhận.',
    'string.empty': 'Người nhận không được để trống.'
  }),
  message: Joi.string().trim().min(1).max(1000).required().label('Message').messages({
    'string.empty': 'Tin nhắn không được để trống.',
    'string.min': 'Tin nhắn phải có ít nhất {#limit} ký tự.',
    'string.max': 'Tin nhắn không được vượt quá {#limit} ký tự.'
  })
});
