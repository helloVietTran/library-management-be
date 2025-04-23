// định nghĩa interface body cho Response
import { IUser } from "../models/User";

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
  label: "< 10" | "10 - 100" | "> 100";
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

export interface LoginBody {
  user: IUser;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenBody {
  accessToken: string;
}

export interface RegisterBody {
  message: string;
  user: IUser;
  accessToken: string;
  refreshToken: string;
}
