import path from 'path';
import handlebars from 'handlebars';
import fs from 'fs';
import { NextFunction, Request, Response } from 'express';
import transporter, { setUpMailOptions } from '../config/nodemailer';
import BorrowRecord from '../models/borrow-record.model';
import { IBorrowRecordPopulated } from '../interfaces/common';
import { SendMailRequestBody } from '../interfaces/request';
import { AppError } from '../config/error';

class EmailController {
  async sendOverdueEmail(req: Request<{}, {}, SendMailRequestBody>, res: Response, next: NextFunction) {
    try {
      const record = (await BorrowRecord.findById(req.body.recordId)) as IBorrowRecordPopulated;
      if (!record) {
        throw AppError.from(new Error('Borrow record not found')).withDetail('recordId', 'Borrow record not found');
      }
      if (!record.isOverdue()) {
        throw AppError.from(new Error('Borrow record is not overdue')).withMessage('Người này còn thời hạn trả sách');
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
