export interface Page<T>{
    content: T[],
    page: {
        number: number;
        totalPages: number;
        totalElements: number;
        size: number;
    };
}