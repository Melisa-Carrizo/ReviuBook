export interface Page<T>{
    content: T[],
    last: boolean,
    totalPages: number,
    first: boolean,
    number: number
}