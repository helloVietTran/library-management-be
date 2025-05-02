import Joi from 'joi';

export const createCommentSchema = Joi.object({
  content: Joi.string().trim().min(1).max(500).required().messages({
    'string.empty': 'Nội dung bình luận không được để trống.',
    'string.max': 'Nội dung bình luận không được vượt quá 500 ký tự.'
  }),
  bookId: Joi.string().trim().required().messages({
    'string.empty': 'ID sách không được để trống.',
    'any.required': 'ID sách là bắt buộc.'
  }),
  rating: Joi.number().integer().min(1).max(5).optional().messages({
    'number.base': 'Rating phải là một số.',
    'number.min': 'Rating tối thiểu là 1.',
    'number.max': 'Rating tối đa là 5.'
  })
});
