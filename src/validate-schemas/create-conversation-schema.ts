import Joi from 'joi';

export const createConversationSchema = Joi.object({
  recipientId: Joi.string().required().messages({
    'string.base': 'Recipient ID must be a string',
    'any.required': 'Recipient ID is required'
  })
});