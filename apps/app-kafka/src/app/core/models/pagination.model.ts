export interface Pagination<T> {
  pages: number;
  size: number;
  totals: number;
  page: number;
  results: T;
}
