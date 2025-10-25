import { Review } from "./Review"

export interface Book {
    id: number,
    category: string,
    description: string,
    releaseDate: Date,
    status: boolean,
    ISBN: string,
    title: string
    author: string,
    publishinHouse: string,
    reviews: Review[]
}