export interface BaseResponse<T> {
    code: number
    error_msg: string
    msg: string
    data: T
}