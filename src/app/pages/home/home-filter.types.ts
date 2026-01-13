export type YearRange = {
  id: string;
  label: string;
  from?: number;
  to?: number;
};

export enum Category {
  NOVELA = 'NOVELA',
  CIENCIA_FICCION = 'CIENCIA_FICCION',
  BIOGRAFIA = 'BIOGRAFIA',
  HISTORIA = 'HISTORIA',
  FANTASIA = 'FANTASIA',
  INFANTIL = 'INFANTIL',
  TERROR = 'TERROR',
  ROMANCE = 'ROMANCE',
}

export interface HomeFilterState {
  categories: Category[];
  yearRangeId: string | null;
  authorQuery: string | null;
  publisherQuery: string | null;
}
