import Joi from 'joi';

export const createBookSchema = Joi.object({
  title: Joi.string().required().messages({
    'string.empty': 'Tiêu đề không được để trống.',
    'any.required': 'Tiêu đề là bắt buộc.'
  }),

  description: Joi.string().optional().messages({
    'string.base': 'Mô tả phải là một chuỗi.'
  }),

  publishedDate: Joi.date().optional().messages({
    'date.base': 'Ngày xuất bản phải là một ngày hợp lệ.'
  }),

  authors: Joi.array().items(Joi.string()).required().messages({
    'array.base': 'Danh sách tác giả phải là một mảng.',
    'any.required': 'Danh sách tác giả là bắt buộc.'
  }),

  genres: Joi.array().items(Joi.string()).optional().messages({
    'array.base': 'Thể loại phải là một mảng chuỗi.'
  }),

  language: Joi.string().optional().messages({
    'string.base': 'Ngôn ngữ phải là một chuỗi.'
  }),

  publisher: Joi.string().allow('').optional().messages({
    'string.base': 'Nhà xuất bản phải là một chuỗi.'
  }),
  
  quantity: Joi.number().min(0).required().messages({
    'number.base': 'Số lượng phải là một số.',
    'number.min': 'Số lượng không được nhỏ hơn 0.',
    'any.required': 'Số lượng sách là bắt buộc.'
  }),

  price: Joi.number().min(0).required().messages({
    'number.base': 'Giá phải là một số.',
    'number.min': 'Giá không được nhỏ hơn 0.',
    'any.required': 'Giá của sách là bắt buộc.'
  }),

  pageCount: Joi.number().min(1).optional().messages({
    'number.base': 'Số lượng trang phải là một số.',
    'number.min': 'Số lượng trang không được nhỏ hơn 1.'
  })
});
