import { RequestHandler } from 'express';

const convertField = (field: any, fieldName: string) => {
  switch (fieldName) {
    case 'dob':
      return new Date(field);
    case 'address':
      if (typeof field === 'string') return JSON.parse(field); // Parse string to object
    case 'awards':
    case 'authors':
    case 'genres':
      return [field]; // Convert string to array
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
