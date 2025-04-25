import Joi from 'joi';

export const payFineSchema = Joi.object({
  paymentMethod: Joi.string().valid('cash', 'card', 'bank_transfer').required().messages({
    'any.only': "Hình thức thanh toán không hợp lệ, chỉ chấp nhận 'cash', 'card', hoặc 'bank_transfer'",
    'string.empty': 'Hình thức thanh toán không được để trống',
    'any.required': 'Hình thức thanh toán là bắt buộc'
  }),

  collectorId: Joi.string().required().messages({
    'string.empty': 'Người thu tiền không được để trống',
    'any.required': 'Người thu tiền là bắt buộc'
  })
});
