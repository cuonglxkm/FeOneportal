export default interface Pagination<T> {
    "totalCount": number,
    "records": T[],
    "pageSize": number,
    "currentPage": number,
    "previousPage": number
}
