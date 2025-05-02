import Joi from 'joi';

export const sendMessageSchema = Joi.object({
  recipientId: Joi.string().required().label('Recipient ID'),
  message: Joi.string().trim().min(1).max(1000).required().label('Message'),
});