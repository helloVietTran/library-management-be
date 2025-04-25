import { BookStatus, PaymentMethod, UserRole, UserStatus } from './common-interfaces';

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
  fullName: string;
  dob: string;
  phoneNumber?: string;
  address?: {
    street: string;
    city: string;
  };
  role: string;
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

export interface UpdateAuthorRequestBody {
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

export interface CreateBookRequestBody {
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
export interface CreateCommentRequestBody {
  content: string;
  userId: string;
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
// email
export interface SendMailRequestBody {
  recordId: string;
  receiver: string;
}

export interface UserParam {
  userId: string;
}

export interface FineParam {
  fineId: string;
}

export interface BorrowRecordParam {
  recordId: string;
}

export interface BookParam {
  bookId: string;
}

export interface AuthorParam {
  authorId: string;
}
