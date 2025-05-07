import { BookStatus, PaymentMethod, UserRole, UserStatus } from './common';

export interface PaginationQuery {
  page: number;
  pageSize: number;
  search: string;
}

export interface FinePaginationQuery extends PaginationQuery {
  paid: 'false' | 'all' | 'true';
}

export interface BorrowRecordPaginationQuery extends PaginationQuery {
  filter: 'all' | 'not-returned' | 'returned';
}

// auth
export interface RegisterRequestBody {
  email: string;
  password: string;
  confirmPassword?: string;
  fullName: string;
  dob: string;
  phoneNumber?: string;
  address?: {
    street: string;
    city: string;
  };
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface RefreshTokenRequestBody {
  refreshToken: string;
}

export interface LogoutRequestBody {
  accessToken: string;
}

export interface IntrospectRequestBody {
  accessToken: string;
}

// authors
export interface CreateAuthorBody {
  name: string;
  biography?: string;
  dob?: string;
  awards?: string[];
  nationality?: string;
}

export interface UpdateAuthorBody {
  name?: string;
  biography?: string;
  dob?: string;
  awards?: string[];
  nationality?: string;
}

// books

export interface DeleteBooksBody {
  bookIds: string[];
}

export interface CreateBookBody {
  title: string;
  description?: string;
  publishedDate?: Date | string;
  quantity: number;
  price: number;
  pageCount: number;
  authors: string[];
  genres: string[];
  language?: string;
  publisher?: string;
}

export interface UpdateBookBody {
  title?: string;
  description?: string;
  genres?: string[];
  quantity?: number;
  price: number;
  publishedDate?: Date | string;
}

// borrow-return
export interface CreateBorrowRecordBody {
  userId: string;
  bookId: string;
  dueDate: Date;
}

export interface ReturnBookBody {
  status: BookStatus;
  note?: string;
}

// comments
export interface CreateCommentBody {
  content: string;
  bookId: string;
  rating?: number;
}

// fines
export interface PayFineBody {
  paymentMethod: PaymentMethod;
  collectorId: string;
}

// users
export interface UpdateUserBody {
  fullName?: string;
  dob?: string;
  phoneNumber?: string;
  status?: UserStatus;
}

export interface PromoteUserBody {
  newRole: UserRole;
}

export interface UpdateUserStatusBody {
  status: UserStatus;
}

export interface CreateUserBody {
  fullName: string;
  email: string;
  dob: string;
}

// email
export interface SendMailRequestBody {
  recordId: string;
  receiver: string;
}

// message
export interface SendMessageBody {
  recipientId: string;
  message: string;
}


export interface CreateConversationBody {
  recipientId: string;
}
