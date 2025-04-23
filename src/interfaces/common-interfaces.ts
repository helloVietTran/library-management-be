import { Handler } from 'express';
import mongoose, { Schema } from 'mongoose';
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

export interface IRole extends Document {
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
}

export interface IBorrowRecord extends Document {
  user: Schema.Types.ObjectId;
  book: Schema.Types.ObjectId;
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
  _id: Schema.Types.ObjectId;
  user: Schema.Types.ObjectId; // người bị phạt
  amount: number;
  paid: boolean;
  paidDate?: Date;
  reason: string;
  paymentMethod?: 'cash' | 'bank_transfer';
  collectedBy?: Schema.Types.ObjectId; // fine collector
  borrowRecord: Schema.Types.ObjectId;
}
// --------------------------- //
export interface TokenPayload {
  sub: string;
  role: UserRole;
}
export interface Requester extends TokenPayload {}

export interface ITokenProvider {
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
