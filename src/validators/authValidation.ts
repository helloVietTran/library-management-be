import { Joi } from "celebrate";

export const loginSchema = Joi.object().keys({
  email: Joi.string().email().required().messages({
    "string.email": "Email không hợp lệ",
    "any.required": "Email là bắt buộc",
  }),
  password: Joi.string().min(3).max(30).required().messages({
    "string.min": "Mật khẩu phải có ít nhất 3 ký tự",
    "string.max": "Mật khẩu không được vượt quá 30 ký tự",
    "any.required": "Mật khẩu là bắt buộc",
  }),
});

export const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Email không hợp lệ",
    "any.required": "Email là bắt buộc",
  }),
  password: Joi.string().min(3).max(30).required().messages({
    "string.min": "Mật khẩu phải có ít nhất 3 ký tự",
    "string.max": "Mật khẩu không được vượt quá 30 ký tự",
    "any.required": "Mật khẩu là bắt buộc",
  }),
  fullName: Joi.string().min(3).max(100).required().messages({
    "string.min": "Họ và tên phải có ít nhất 3 ký tự",
    "string.max": "Họ và tên không được vượt quá 100 ký tự",
    "any.required": "Họ và tên là bắt buộc",
  }),
  dob: Joi.date().iso().required().messages({
    "date.base": "Ngày sinh không hợp lệ",
    "any.required": "Ngày sinh là bắt buộc",
  }),
  phoneNumber: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .optional()
    .messages({
      "string.pattern.base": "Số điện thoại phải từ 10 đến 15 chữ số",
    }),
  address: Joi.object({
    street: Joi.string().required().messages({
      "any.required": "Địa chỉ đường là bắt buộc",
    }),
    city: Joi.string().required().messages({
      "any.required": "Thành phố là bắt buộc",
    }),
  })
    .required()
    .messages({
      "any.required": "Địa chỉ là bắt buộc",
    }),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    "any.required": "Refresh Token là bắt buộc",
    "string.empty": "Refresh Token không được để trống",
  }),
});

export const logoutSchema = Joi.object({
  accessToken: Joi.string().required().messages({
    "any.required": "Token là bắt buộc",
    "string.empty": "Token không được để trống",
  }),
});
