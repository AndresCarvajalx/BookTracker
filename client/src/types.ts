export enum View {
  Libros = "libros",
  Leidos = "leidos",
  PorLeer = "por_leer",
  Leyendo = "leyendo",
  Agregar = "agregar",
  Perfil = "perfil",
}

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export enum Status {
  READ = "read",
  TO_READ = "to_read",
  READING = "reading",
  ALL = "all",
}

export type CreateBookPayload = {
  title: string;
  author: string;
  genre?: string;
  status: Status;
  pdfPath?: string;
  coverPath?: string;
  totalPages?: number;
  currentPage?: number;
  rating?: number;
  premise?: string;
};

export interface Book {
  id: number;
  title: string;
  author: string;
  genre?: string;
  coverPath?: string;
  pdfPath?: string;
  totalPages?: number;
  currentPage?: number;
  rating?: number;
  review?: string;
  premise?: string;
  status: Status;
  createdAt: string;
}

export interface BookDetail {
  id: number;
  title: string;
  author?: string;
  status?: string;
  rating?: number | null;
  cover_path?: string | null;
  pdf_path?: string | null;
  total_pages?: number | null;
  premise?: string | null;
  review?: string | null;
  created_at?: string | null;
}
