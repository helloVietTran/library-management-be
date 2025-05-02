import { RequestHandler } from 'express';

const convertField = (field: any, fieldName: string) => {
  switch (fieldName) {
    case 'dob':
      return new Date(field);
    case 'address':
      if (typeof field === 'string') return JSON.parse(field);
    case 'awards':
    case 'authors':
    case 'genres':
      return Array.isArray(field) ? field : [field]; // chỉ ép thành mảng nếu chưa là mảng
    default:
      return field;
  }
};

// Middleware to convert form data for Joi validation
const convertFormData: RequestHandler = (req, res, next) => {
  try {
    Object.keys(req.body).forEach((key) => {
      req.body[key] = convertField(req.body[key], key);
    });
    next();
  } catch (error) {
    res.status(400).json({ message: 'Dữ liệu form không hợp lệ' });
  }
};

export default convertFormData;
