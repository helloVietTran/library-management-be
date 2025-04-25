import Joi from 'joi';

export const sendEmailSchema = Joi.object({
  recordId: Joi.string().required().messages({
    'string.empty': 'recordId không được để trống',
    'any.required': 'recordId là bắt buộc'
  })
});
