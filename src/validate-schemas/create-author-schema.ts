import Joi from 'joi';

export const createAuthorSchema = Joi.object({
  name: Joi.string().required().messages({
    'string.empty': 'Tên tác giả không được để trống.',
    'any.required': 'Tên tác giả là bắt buộc.'
  }),
  biography: Joi.string().optional().messages({
    'string.base': 'Giới thiệu phải là một chuỗi.'
  }),
  dob: Joi.date().optional().messages({
    'date.base': 'Ngày sinh phải là một ngày hợp lệ.'
  }),
  awards: Joi.array().items(Joi.string()).optional().messages({
    'array.base': 'Danh hiệu phải là một mảng các chuỗi.'
  }),
  nationality: Joi.string().optional().messages({
    'string.base': 'Quốc tịch phải là một chuỗi.'
  })
});
