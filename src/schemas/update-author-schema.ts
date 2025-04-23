import Joi from 'joi';

export const updateAuthorSchema = Joi.object({
  name: Joi.string().optional().messages({
    'string.empty': 'Tên tác giả không được để trống.'
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
