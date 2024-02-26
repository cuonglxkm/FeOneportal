export interface Pagination2<T> {
  limit: number;
  total: number;
  offset: number;
  content: T;
}
