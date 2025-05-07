import { Joi } from 'celebrate';

export const registerSchema = Joi.object({
  fullName: Joi.string().min(3).max(100).required().messages({
    'string.min': 'Họ và tên phải có ít nhất 3 ký tự',
    'string.max': 'Họ và tên không được vượt quá 100 ký tự',
    'any.required': 'Họ và tên là bắt buộc'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Email không hợp lệ',
    'any.required': 'Email là bắt buộc'
  }),
  password: Joi.string().min(6).max(30).required().messages({
    'string.min': 'Mật khẩu phải có ít nhất 6 ký tự',
    'string.max': 'Mật khẩu không được vượt quá 30 ký tự',
    'any.required': 'Mật khẩu là bắt buộc'
  }),
  dob: Joi.date().iso().required().messages({
    'date.base': 'Ngày sinh không hợp lệ',
    'any.required': 'Ngày sinh là bắt buộc'
  }),
  confirmPassword: Joi.string().min(6).max(30).optional().messages({
    'string.min': 'Mật khẩu nhập lại phải có ít nhất 6 ký tự',
    'string.max': 'Mật khẩu nhập lại không được vượt quá 30 ký tự'
  })
});
