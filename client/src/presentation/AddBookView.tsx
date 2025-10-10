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
      setError("Title and author are required");
      return;
    }

    if (status === Status.READING) {
      if (totalPages === "" || Number(totalPages) <= 0) {
        setError(
          "Total pages is required and must be > 0 when status is Reading"
        );
        return;
      }
      if (currentPage === "" || Number(currentPage) < 0) {
        setError(
          "Current page is required and must be >= 0 when status is Reading"
        );
        return;
      }
      if (Number(currentPage) > Number(totalPages)) {
        setError("Current page cannot be greater than total pages");
        return;
      }
    }

    if (status === Status.READ) {
      if (rating !== "" && (Number(rating) < 0 || Number(rating) > 5)) {
        setError("Rating must be between 0 and 5");
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

      if (!bookId) throw new Error("Server did not return created book id");

      if (pdfFile) {
        const uploadRes = await uploadBookPdf(bookId, pdfFile);
        if (uploadRes.status !== 200) {
          console.warn("PDF upload failed:", uploadRes);
        } else {
          console.log("PDF uploaded successfully");
        }
      }

      if (coverFile) {
        const uploadRes = await uploadBookCover(bookId, coverFile);
        if (uploadRes.status !== 200) {
          console.warn("Cover upload failed:", uploadRes);
        } else {
          console.log("Cover uploaded successfully");
        }
      }

      setLoading(false);
      view(View.Libros);
    } catch (err: any) {
      console.error("Add book error:", err);
      setError(err?.message || err);
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-2xl rounded bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold">Add new book</h2>

        {error && <ErrorBanner error={error} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Title *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded border px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Author *</label>
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full rounded border px-3 py-2"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Genre</label>
              <input
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full rounded border px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
                className="w-full rounded border px-3 py-2"
              >
                <option value={Status.TO_READ}>To read</option>
                <option value={Status.READING}>Reading</option>
                <option value={Status.READ}>Read</option>
              </select>
            </div>
          </div>

          {status === Status.READING && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Total pages *
                </label>
                <input
                  type="number"
                  value={totalPages}
                  onChange={(e) =>
                    setTotalPages(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="w-full rounded border px-3 py-2"
                  min={1}
                  required={status === Status.READING}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Current page *
                </label>
                <input
                  type="number"
                  value={currentPage}
                  onChange={(e) =>
                    setCurrentPage(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="w-full rounded border px-3 py-2"
                  min={0}
                  required={status === Status.READING}
                />
              </div>
            </div>
          )}

          {status === Status.READ && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Total pages (optional)
                </label>
                <input
                  type="number"
                  value={totalPages}
                  onChange={(e) =>
                    setTotalPages(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="w-full rounded border px-3 py-2"
                  min={1}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Rating (0-5)
                </label>
                <input
                  type="number"
                  step="0.1"
                  max={5}
                  min={0}
                  value={rating}
                  onChange={(e) =>
                    setRating(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="w-full rounded border px-3 py-2"
                />
              </div>
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium">
              Premise / Notes
            </label>
            <textarea
              value={premise}
              onChange={(e) => setPremise(e.target.value)}
              className="w-full rounded border px-3 py-2"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">
                PDF (optional)
              </label>
              <input
                accept="application/pdf"
                type="file"
                onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
                className="w-full"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Cover image (optional)
              </label>
              <input
                accept="image/*"
                type="file"
                onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              disabled={loading}
              type="submit"
              className="rounded bg-primary px-4 py-2 text-white disabled:opacity-60"
            >
              {loading ? "Saving..." : "Create book"}
            </button>

            <button
              type="button"
              onClick={() => view(View.Libros)}
              className="text-sm text-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
