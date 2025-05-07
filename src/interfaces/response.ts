import { IUser } from './common';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}
// response phân trang
export interface PaginatedResponse<T = any>{
  data: T[];
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  success: boolean;
  message: string;
}

// define body response interfaces
export interface PaginatedBody<T> {
  data: T[];
  currentPage: number;
  pageSize: number;
  totalPages: number;
  elementsPerPage?: number;
  totalElement?: number;
}

export interface TimeBasedStatsBody {
  currentMonth: number;
  previousMonth: number;
}

export interface BooksCountBody {
  quantity: number;
}

export interface BorrowedTurnsCountStatsBody {
  label: '< 10' | '10 - 100' | '> 100';
  count: number;
  _id: any;
}

interface MonthlyBorrowAndReturnedBooksCount {
  borrowedBooksCount: number;
  returnedBooksCount: number;
}

export interface StatsBorrowedAndReturnedBooksBody {
  [month: string]: MonthlyBorrowAndReturnedBooksCount;
}

export interface MonthlyBorrowedBookCountBody {
  [month: string]: number;
}

export interface BorrowRecordsCountBody {
  quantity: number;
}

export interface LoginResponseBody {
  user: IUser;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenResponseBody {
  accessToken: string;
}

export interface RegisterResponseBody {
  message: string;
  user: IUser;
  accessToken: string;
  refreshToken: string;
}
