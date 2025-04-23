import { Joi } from 'celebrate';

export const updateUserSchema = Joi.object({
  fullName: Joi.string().min(3).max(100).messages({
    'string.min': 'Họ và tên phải có ít nhất 3 ký tự',
    'string.max': 'Họ và tên không được vượt quá 100 ký tự'
  }),

  dob: Joi.date().iso().messages({
    'date.base': 'Ngày sinh không hợp lệ'
  }),

  phoneNumber: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .messages({
      'string.pattern.base': 'Số điện thoại phải từ 10 đến 15 chữ số'
    }),

  status: Joi.string().valid('active', 'locked', 'banned').messages({
    'any.only': "Trạng thái chỉ có thể là 'active', 'locked' hoặc 'banned'"
  })
});
