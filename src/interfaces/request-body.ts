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
export interface CreateAuthorRequestBody {
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
export interface DeleteBooksRequestBody {
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

export interface UpdateBookRequestBody {
  title?: string;
  description?: string;
  genres?: string[];
  quantity?: number;
  price: number;
  publishedDate?: Date | string;
}

// borrow-return
export interface CreateBorrowRecordRequestBody {
  userId: string;
  bookId: string;
  dueDate: Date;
}

export interface ReturnBookRequestBody {
  status: 'ok' | 'break' | 'lost';
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
export interface PayFineRequestBody {
  paymentMethod: 'cash' | 'card' | 'bank_transfer';
  collectorId: string;
}

// users
export interface UpdateUserRequestBody {
  fullName?: string;
  dob?: string;
  phoneNumber?: string;
  status?: 'active' | 'locked' | 'banned';
}

export interface PromoteUserRequestBody {
  newRole: 'librarian' | 'admin' | 'user';
}

export interface UpdateUserStatusRequestBody {
  status: 'active' | 'banned';
}
// email
export interface SendMailRequestBody {
  recordId: string;
  receiver: string;
}
