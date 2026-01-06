import { Book } from "./Book";

export type Stage = 'PENDIENTE' | 'EN_PROCESO' | 'TERMINADO';

export interface BookStage {
    id: number,
    idUser: number,
    book: Book,
    stage: string
}