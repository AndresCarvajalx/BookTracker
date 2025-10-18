/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, type Dispatch, type SetStateAction } from "react";
import { addBook, uploadBookCover, uploadBookPdf } from "../api/books";
import { Status, View } from "../types";
import ErrorBanner from "./components/ErrorBanner";

type CreateBookPayload = {
  title: string;
  author: string;
  genre?: string;
  status: Status;
  total_pages?: number;
  pdf_path?: string;
  cover_path?: string;
  current_page?: number;
  rating?: number;
  premise?: string;
};

interface AddBookViewProps {
  view: Dispatch<SetStateAction<View>>;
}

export function AddBookView({ view }: AddBookViewProps) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");
  const [status, setStatus] = useState<Status>(Status.TO_READ);
  const [totalPages, setTotalPages] = useState<number | "">("");
  const [currentPage, setCurrentPage] = useState<number | "">("");
  const [rating, setRating] = useState<number | "">("");
  const [premise, setPremise] = useState("");

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetMessages = () => setError(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!title.trim() || !author.trim()) {
      setError("Título y autor son obligatorios");
      return;
    }

    if (status === Status.READING) {
      if (totalPages === "" || Number(totalPages) <= 0) {
        setError("Total de páginas debe ser mayor a 0");
        return;
      }
      if (currentPage === "" || Number(currentPage) < 0) {
        setError("Página actual debe ser 0 o más");
        return;
      }
      if (Number(currentPage) > Number(totalPages)) {
        setError("Página actual no puede ser mayor al total");
        return;
      }
    }

    if (status === Status.READ) {
      if (rating !== "" && (Number(rating) < 0 || Number(rating) > 5)) {
        setError("La calificación debe estar entre 0 y 5");
        return;
      }
    }

    setLoading(true);
    try {
      const payload: CreateBookPayload = {
        title: title.trim(),
        author: author.trim(),
        status,
      };

      if (genre.trim()) payload.genre = genre.trim();
      if (premise.trim()) payload.premise = premise.trim();

      if (status === Status.READING) {
        payload.total_pages = Number(totalPages);
        payload.current_page = Number(currentPage);
      } else if (status === Status.READ) {
        if (rating !== "") payload.rating = Number(rating);
        if (totalPages !== "") payload.total_pages = Number(totalPages);
      }

      const createRes = await addBook(payload);
      const created = createRes.data;
      const bookId = created?.id ?? created?.book?.id;
      if (!bookId) throw new Error("No se obtuvo el ID del libro creado");

      if (pdfFile) {
        const uploadRes = await uploadBookPdf(bookId, pdfFile);
        if (uploadRes.status !== 200) console.warn("Error al subir PDF");
      }

      if (coverFile) {
        const uploadRes = await uploadBookCover(bookId, coverFile);
        if (uploadRes.status !== 200) console.warn("Error al subir portada");
      }

      setLoading(false);
      view(View.Libros);
    } catch (err: any) {
      console.error("Add book error:", err);
      setError(err?.message || "Error al crear libro");
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center bg-(--color-bg) min-h-screen px-4 py-10">
      <div className="w-full max-w-2xl rounded-lg bg-(--color-surface) p-8 shadow-md">
        <h2 className="mb-6 text-2xl font-semibold text-(--color-text)">
          Agregar libro nuevo
        </h2>

        {error && <ErrorBanner error={error} />}

        <form onSubmit={handleSubmit} className="space-y-5">
          <FormInput
            label="Título *"
            value={title}
            onChange={setTitle}
            required
          />

          <FormInput
            label="Autor *"
            value={author}
            onChange={setAuthor}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Genero *"
              value={genre}
              required
              onChange={setGenre}
            />
            <div>
              <label className="mb-1 block text-sm font-medium text-(--color-text)">
                Estado
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
                required
                className="w-full rounded-md border border-(--color-border) bg-(--color-bg) px-3 py-2 text-(--color-text) focus:outline-none focus:ring-2 focus:ring-(--color-primary) appearance-none"
              >
                <option value={Status.TO_READ}>Para leer</option>
                <option value={Status.READING}>Leyendo</option>
                <option value={Status.READ}>Leído</option>
              </select>
            </div>
          </div>

          {status === Status.READING && (
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Total de páginas *"
                type="number"
                value={totalPages}
                onChange={setTotalPages}
                required
              />
              <FormInput
                label="Pagina actual *"
                type="number"
                value={currentPage}
                onChange={setCurrentPage}
                required
              />
            </div>
          )}

          {status === Status.READ && (
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Total de paginas (opcional)"
                type="number"
                value={totalPages}
                onChange={setTotalPages}
              />
              <FormInput
                label="Calificación (0-5)"
                type="number"
                step="0.1"
                min={0}
                max={5}
                value={rating}
                onChange={setRating}
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-(--color-text)">
              Premisa / Notas
            </label>
            <textarea
              value={premise}
              onChange={(e) => setPremise(e.target.value)}
              className="w-full rounded-md border border-(--color-border) px-3 py-2 text-(--color-text) focus:ring-2 focus:ring-(--color-primary) focus:outline-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FileInput label="PDF (opcional)" onChange={setPdfFile} />
            <FileInput
              label="Imagen cover (opcional)"
              onChange={setCoverFile}
            />
          </div>

          <div className="flex items-center justify-between mt-6">
            <button
              disabled={loading}
              type="submit"
              className="rounded-md bg-(--color-primary) hover:bg-(--color-primary-hover) px-5 py-2 text-white font-medium transition disabled:opacity-60"
            >
              {loading ? "Guardando..." : "Crear libro"}
            </button>

            <button
              type="button"
              onClick={() => view(View.Libros)}
              className="text-sm text-(--color-text-secondary) hover:underline"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  value: any;
  onChange: (v: any) => void;
}

function FormInput({
  label,
  value,
  onChange,
  required = false,
  type = "text",
  ...rest
}: FormInputProps) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-(--color-text)">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value === "" ? "" : e.target.value)}
        required={required}
        className="w-full rounded-md border border-(--color-border) px-3 py-2 text-(--color-text) focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
        {...rest}
      />
    </div>
  );
}

function FileInput({
  label,
  onChange,
}: {
  label: string;
  onChange: (file: File | null) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-(--color-text)">
        {label}
      </label>
      <input
        type="file"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        className="w-full text-sm text-(--color-text-secondary)"
      />
    </div>
  );
}
