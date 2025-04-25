import path from 'path';
import handlebars from 'handlebars';
import fs from 'fs';
import { NextFunction, Request, Response } from 'express';

import transporter, { setUpMailOptions } from '../config/nodemailer';
import BorrowRecord from '../models/borrow-record-model';
import AppError from '../error-handlers/AppError';
import { IBorrowRecordPopulated } from '../interfaces/common-interfaces';
import { SendMailRequestBody } from '../interfaces/request';

class EmailController {
  async sendOverdueEmail(req: Request<{}, {}, SendMailRequestBody>, res: Response, next: NextFunction) {
    try {
      const record = (await BorrowRecord.findById(req.body.recordId)) as IBorrowRecordPopulated;
      if (!record) {
        throw new AppError('Bản ghi mượn không tồn tại', 400, '/email/send-overdue-email');
      }
      if (!record.isOverdue()) {
        throw new AppError('Chưa quá hạn trả', 400, '/email/send-overdue-email');
      }

      const templatePath = path.join(
        __dirname,
        'templates',
        '..', // go up one directory to src
        'overdue-notice.html'
      );
      const source = fs.readFileSync(templatePath, 'utf8');
      const template = handlebars.compile(source);

      const replacements = {
        name: record.user.fullName,
        bookTitle: record.book.title,
        dueDate: record.dueDate,
        borrowDate: record.createdAt,
        overdueDays: record.getOverdueDays
      };

      const htmlToSend = template(replacements);

      const mailOptions = setUpMailOptions({
        receiver: req.body.receiver,
        subject: 'Thông báo quá hạn trả sách',
        html: htmlToSend
      });

      const info = await transporter.sendMail(mailOptions);

      res.json(info.response);
    } catch (error) {
      next(error);
    }
  }
}

export default new EmailController();
