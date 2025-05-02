import { Joi } from 'celebrate';

export const createUserSchema = Joi.object({
  fullName: Joi.string().min(3).max(100).required().messages({
    'string.min': 'Họ và tên phải có ít nhất 3 ký tự',
    'string.max': 'Họ và tên không được vượt quá 100 ký tự',
    'any.required': 'Họ và tên là bắt buộc',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Email không hợp lệ',
    'any.required': 'Email là bắt buộc',
  }),
  dob: Joi.date().iso().required().messages({
    'date.base': 'Ngày sinh không hợp lệ',
    'any.required': 'Ngày sinh là bắt buộc',
  }),
});
