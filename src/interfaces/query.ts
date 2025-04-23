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
  filter: 'all' | 'not-returned';
}

export interface FineQuery {
  search: string;
  page: string;
  pageSize: string;
  paid: 'false' | 'all' | 'true';
}
