import { Review } from "./Review"

export interface BookSheet {
    id: number,
    category: string,
    description: string,
    releaseDate: Date,
    status: boolean,
    title: string,
    author: string,
    publishingHouse: string,
    urlImage: string,
    reviewsDTO: Review[]
    ISBN: string
    
}