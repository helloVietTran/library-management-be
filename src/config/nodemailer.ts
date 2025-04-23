import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.APP_PASS
  }
});

export function setUpMailOptions({ receiver, subject, html }: { receiver: string; subject: string; html: string }) {
  return {
    from: process.env.ADMIN_EMAIL,
    to: receiver,
    subject,
    html
  };
}

export default transporter;
