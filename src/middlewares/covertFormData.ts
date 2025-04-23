import { RequestHandler } from "express";

// chuyển formData thành Json để Joi validate
const convertFormData: RequestHandler = (req, res, next) => {
  try {
    if (req.body.dob) {
      req.body.dob = new Date(req.body.dob);
    }

    if (typeof req.body.address === "string") {
      req.body.address = JSON.parse(req.body.address);
    }

    if (typeof req.body.awards === "string") {
      req.body.awards = [req.body.awards];
    }

    if (typeof req.body.authors === "string") {
      req.body.authors = [req.body.authors];
    }

    if (typeof req.body.genres === "string") {
      req.body.genres = [req.body.genres];
    }

    next();
  } catch (error) {
    res.status(400).json({ message: "Dữ liệu form không hợp lệ" });
  }
};

export default convertFormData;
