import path from "path";
import handlebars from "handlebars";
import fs from "fs";
import { NextFunction, Response } from "express";

import transporter, { setUpMailOptions } from "../config/nodemailer";
import { SendMailRequest } from "../types/request";
import BorrowRecord, { IBorrowRecordPopulated } from "../models/BorrowRecord";
import AppError from "../error-handlers/AppError";

class EmailController {
  async sendOverdueEmail(
    req: SendMailRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
        const record = await BorrowRecord.findById(req.body.recordId) as IBorrowRecordPopulated;
      if (!record) {
        throw new AppError(
          "BORROW RECORD không tồn tại",
          400,
          "/email/send-overdue-email"
        );
      }
      if (!record.isOverdue()) {
        throw new AppError(
            "Chưa quá hạn trả",
            400,
            "/email/send-overdue-email"
          );
      }

      const templatePath = path.join(
        __dirname,
        "templates",
        "overdue-notice.html"
      );
      const source = fs.readFileSync(templatePath, "utf8");
      const template = handlebars.compile(source);

      const replacements = {
        name: record.user.fullName,
        bookTitle: record.book.title,
        dueDate: record.dueDate,
        borrowDate: record.createdAt,
        overdueDays: record.getOverdueDays,
      };

      const htmlToSend = template(replacements);

      const mailOptions = setUpMailOptions({
        receiver: req.body.receiver,
        subject: "Thông báo quá hạn trả sách",
        html: htmlToSend,
      });

      const info = await transporter.sendMail(mailOptions);

      res.json(info.response);
    } catch (error) {
      next(error);
    }
  }
}

export default new EmailController();
