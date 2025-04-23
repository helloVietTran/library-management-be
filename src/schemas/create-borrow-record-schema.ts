import Joi from 'joi';

export const createBorrowRecordSchema = Joi.object({
  userId: Joi.string().required().messages({
    'string.empty': 'ID người mượn không được để trống.',
    'any.required': 'Người mượn là bắt buộc.'
  }),
  bookId: Joi.string().required().messages({
    'string.empty': 'ID sách không được để trống.',
    'any.required': 'Sách là bắt buộc.'
  }),
  dueDate: Joi.date().greater('now').required().messages({
    'date.base': 'Ngày dự kiến trả phải là một ngày hợp lệ.',
    'date.greater': 'Ngày dự kiến trả phải ở tương lai.',
    'any.required': 'Ngày dự kiến trả là bắt buộc.'
  })
});
