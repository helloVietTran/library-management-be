// định nghĩa interface body, query của Request, và interface extends Request
import { Request } from "express";

// query
export interface PrimaryQuery {
  search: string;
  page: string;
  pageSize: string;
}

export interface BorrowRecordQuery {
  search: string;
  page: string;
  pageSize: string;
  filter: "all" | "not-returned";
}

export interface FineQuery {
  search: string;
  page: string;
  pageSize: string;
  paid: "false" | "all" | "true";
}

// request chung
export interface AuthRequest extends Request {
  id?: string;
  role?: string;
}

// request /auth
export interface RegisterRequest extends Request {
  body: {
    email: string;
    password: string;
    fullName: string;
    dob: string;
    phoneNumber?: string;
    address?: {
      street: string;
      city: string;
    };
    role: string;
  };
}

export interface LoginRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

export interface RefreshTokenRequest extends Request {
  body: {
    refreshToken: string;
  };
}

export interface LogoutRequest extends Request {
  body: {
    accessToken: string;
  };
}

export interface IntrospectRequest extends Request {
  body: {
    accessToken: string;
  };
}

// request /authors
export interface CreateAuthorRequest extends Request {
  body: {
    name: string;
    biography?: string;
    dob?: string;
    awards?: string[];
    nationality?: string;
  };
}

export interface UpdateAuthorRequest extends Request {
  params: {
    authorId: string;
  };
  body: {
    name?: string;
    biography?: string;
    dob?: string;
    awards?: string[];
    nationality?: string;
  };
}

// request /books
export interface DeleteBooksRequest extends Request {
  body: {
    bookIds: string[];
  };
}

export interface CreateBookRequest extends Request {
  body: {
    title: string;
    description?: string;
    publishedDate?: Date | string;
    authors: string[];
    genres: string[];
    language?: string;
    publisher?: string;
    quantity: number;
    price: number;
    pageCount: number;
  };
}

export interface UpdateBookRequest extends Request {
  params: {
    bookId: string;
  };
  body: {
    title?: string;
    description?: string;
    genres?: string[];
    quantity?: number;
    price: number;
    publishedDate?: Date | string;
  };
}

// request /borrow-return
export interface CreateBorrowRecordRequest extends Request {
  body: {
    userId: string;
    bookId: string;
    dueDate: Date;
  };
}

export interface ReturnBookRequest extends Request {
  params: {
    recordId: string;
  };
  body: {
    status: "ok" | "break" | "lost";
    note?: string;
  };
}

// request /comments
export interface CreateCommentRequest extends Request {
  body: {
    content: string;
    userId: string;
    bookId: string;
    rating?: number;
  };
}

// request /fines
export interface PayFineRequest extends Request {
  body: {
    paymentMethod: "cash" | "card" | "bank_transfer";
    collectorId: string;
  };
}

// request /users
export interface UpdateUserRequest extends Request {
  body: {
    fullName?: string;
    dob?: string;
    phoneNumber?: string;
    status?: "active" | "locked" | "banned";
  };
}

export interface PromoteUserRequest extends Request {
  params: {
    userId: string;
  };
  body: {
    newRole: "librarian" | "admin" | "user";
  };
}

export interface UpdateUserStatusRequest extends Request {
  params: {
    userId: string;
  };
  body: {
    status: "active" | "banned";
  };
}

// email
export interface SendMailRequest extends Request {
  body: {
    recordId: string;
    receiver: string;
  };
}
