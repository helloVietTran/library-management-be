import Joi from 'joi';

export const loginSchema = Joi.object().keys({
  email: Joi.string().email().required().messages({
    'string.email': 'Email không hợp lệ',
    'any.required': 'Email là bắt buộc'
  }),
  password: Joi.string().min(3).max(30).required().messages({
    'string.min': 'Mật khẩu phải có ít nhất 3 ký tự',
    'string.max': 'Mật khẩu không được vượt quá 30 ký tự',
    'any.required': 'Mật khẩu là bắt buộc'
  })
});
