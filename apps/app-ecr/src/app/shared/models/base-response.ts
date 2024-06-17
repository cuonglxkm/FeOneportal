export interface BaseResponse<T> {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  previousPage: number;
  records: T;
}
