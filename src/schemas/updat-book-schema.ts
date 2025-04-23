import Joi from 'joi';

export const updateBookSchema = Joi.object({
  title: Joi.string().optional().messages({
    'string.empty': 'Tiêu đề không được để trống.'
  }),

  description: Joi.string().optional().messages({
    'string.base': 'Mô tả phải là một chuỗi.'
  }),

  genres: Joi.array().items(Joi.string()).optional().messages({
    'array.base': 'Thể loại phải là một mảng chuỗi.'
  }),

  quantity: Joi.number().min(0).optional().messages({
    'number.base': 'Số lượng phải là một số.',
    'number.min': 'Số lượng không được nhỏ hơn 0.'
  }),

  price: Joi.number().min(0).optional().messages({
    'number.base': 'Giá phải là một số.',
    'number.min': 'Giá không được nhỏ hơn 0.'
  }),

  publishedDate: Joi.date().optional().messages({
    'date.base': 'Ngày xuất bản phải là một ngày hợp lệ.'
  }),

  publisher: Joi.string().optional().messages({
    'string.base': 'Nhà xuất bản phải là một chuỗi.'
  }),

  pageCount: Joi.number().min(1).optional().messages({
    'number.base': 'Số lượng trang phải là một số.',
    'number.min': 'Số lượng trang không được nhỏ hơn 1.'
  })
});
