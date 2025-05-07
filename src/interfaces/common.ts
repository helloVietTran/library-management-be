import { Handler } from 'express';
import mongoose, { ObjectId, Schema, Document } from 'mongoose';
import { Socket } from 'socket.io';

export enum BookStatus {
  OK = 'ok',
  BREAK = 'break',
  LOST = 'lost'
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  LIBRARIAN = 'librarian'
}

export enum UserStatus {
  ACTIVE = 'active',
  LOCKED = 'locked'
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  BANK_TRANSFER = 'bank_transfer'
}

export interface IRole extends Document {
  _id: ObjectId;
  name: UserRole;
  description?: string;
}

export interface IAddress {
  street: string;
  city: string;
  zipCode: string;
}

export interface IUser extends Document {
  _id: string;
  avatar?: string;
  fullName: string;
  email: string;
  password: string;
  role: Schema.Types.ObjectId | IRole;
  dob: Date;
  phoneNumber?: string;
  address: IAddress;
  bio?: string;
  status: UserStatus;
  readBooksCount: number;
}

export interface IAuthor extends Document {
  name: string;
  biography?: string;
  dob?: Date;
  awards?: string[];
  imgSrc?: string;
  nationality?: string;
}

export interface IBook extends Document {
  title: string;
  description?: string;
  publishedDate?: Date;
  authors: Schema.Types.ObjectId[];
  genres?: string[];
  coverImage?: string;
  language?: string;
  publisher?: string;
  quantity: number;
  price: number;
  pageCount: number;
  borrowedTurnsCount: number;
  ratingsCount?: number;
  ratingPoint?: number;
}

export interface IBorrowRecord extends Document {
  user: Schema.Types.ObjectId | string;
  book: Schema.Types.ObjectId | string;
  borrowDate: Date;
  dueDate: Date;
  returnDate?: Date;
  fine?: Schema.Types.ObjectId;
  status: BookStatus;
  note?: string;
  createdAt: Date;
  updatedAt: Date;

  isOverdue: () => boolean;
  getOverdueDays(): number;
}
// Define a populated version of the borrow record, with user and book fully populated
export interface IBorrowRecordPopulated extends Omit<IBorrowRecord, 'user' | 'book'> {
  user: IUser;
  book: IBook;
}

export interface IComment extends Document {
  content: string;
  user: Schema.Types.ObjectId;
  book: Schema.Types.ObjectId;
  rating: number;
  likes: number;
  replies: { user: Schema.Types.ObjectId; content: string; createdAt: Date }[];
}

interface ILastMessage {
  text: string;
  sender: mongoose.Types.ObjectId;
  seen: boolean;
}

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[];
  lastMessage: ILastMessage;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDisabledToken extends Document {
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface IFine extends Document {
  amount: number;
  paid: boolean;
  paidDate?: Date;
  reason: string;
  paymentMethod?: PaymentMethod;
  collectedBy?: Schema.Types.ObjectId;
  borrowRecord: Schema.Types.ObjectId;
}
// --------------------------- //
export interface TokenPayload {
  sub: string;
  role: UserRole;
}
export interface Requester extends TokenPayload {}

export interface ITokenServiceProvider {
  generateToken(payload: TokenPayload): Promise<string>;
  generateRefreshToken(payload: TokenPayload): Promise<string>;
  verifyToken(token: string): Promise<TokenPayload | null>;
}

export interface IMiddlewareFactory {
  auth: Handler;
  optionAuth: Handler;
  checkingRoles: (roles: UserRole[]) => Handler;
  socketAuth: (socket: Socket, next: (err?: Error) => void) => void;
  convertFormData: Handler;
}

// --------------- //
export interface UserSocketMap {
  [key: string]: string;
}
