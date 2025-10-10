// src/api/books.ts
import axios from "./axios";
import { Book } from "../types";

export const getBooks = async (): Promise<Book[]> => {
  const res = await axios.get("/books/");
  return res.data;
};

export const getBookById = async (id: number): Promise<Book> => {
  const res = await axios.get(`/books/${id}`);
  return res.data;
};

export const addBook = async (book: Partial<Book>) => {
  return axios.post("/books/", book);
};

export const updateBook = async (id: number, book: Partial<Book>) => {
  return axios.put(`/books/${id}`, book);
};

export const deleteBook = async (id: number) => {
  return axios.delete(`/books/${id}`);
};

export const getBookPdf = async (id: number): Promise<Blob> => {
  const res = await axios.get(`/books/${id}/pdf`, { responseType: "blob" });
  return res.data;
};

export const uploadBookPdf = async (id: number, file: File) => {
  const formData = new FormData();
  formData.append("pdf", file);
  return axios.put(`/books/${id}/pdf`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const uploadBookCover = async (id: number, file: File) => {
  const formData = new FormData();
  formData.append("cover", file);
  return axios.put(`/books/${id}/cover`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const getBookCover = async (id: number): Promise<Blob> => {
  const res = await axios.get(`/books/${id}/cover`, { responseType: "blob" });
  return res.data;
};
