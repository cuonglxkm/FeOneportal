export interface ListContentPage<T> {
  total: number;
  offset: number;
  limit: number;
  content: T[];
}