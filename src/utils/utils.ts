import moment from 'moment';
import 'moment/locale/vi';
import { ApiResponse, PaginatedResponse } from '../interfaces/response';
import { PaginationQuery } from '../interfaces/request';
import { Request } from 'express';

moment.locale('vi');

export const formatHumanReadableDate = (createdAt: string | Date): string => {
  const date = moment(createdAt);

  if (!date.isValid()) {
    return 'Ngày không hợp lệ';
  }

  const now = moment();
  const diffYears = now.diff(date, 'years');

  if (diffYears >= 1) {
    return date.format('DD/MM/YYYY');
  }
  return date.fromNow();
};

export const successResponse = <T>(message: string, data?: T): ApiResponse<T> => ({
  success: true,
  message,
  ...(data !== undefined && { data })
});

export const errorResponse = <T = any>(message: string, data?: T): ApiResponse<T> => ({
  success: false,
  message,
  ...(data !== undefined && { data })
});

export function paginateResponse<T>(
  data: T[],
  page: number,
  pageSize: number,
  totalItems: number,
  message = 'Lấy danh sách thành công'
): PaginatedResponse<T> {
  const totalPages = Math.ceil(totalItems / pageSize);
  return {
    data,
    currentPage: page,
    pageSize,
    totalPages,
    totalItems,
    success: true,
    message
  };
}

// get value from query
export function parsePaginationQuery(req: Request<any, any, any, any>): PaginationQuery {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 10;
  const search = (req.query.search as string)?.trim() || '';

  return { page, pageSize, search };
}
