import React, { useEffect, useRef, useState } from "react";
import {
  getBookCover,
  updateBook,
  uploadBookCover,
  uploadBookPdf,
} from "../../api/books";
import { Status, type Book, type BookDetail } from "../../types";

interface Props {
  book: BookDetail;
  open: boolean;
  onClose: () => void;
  onSaved: (updated: BookDetail) => void;
}

export default function BookEditModal({ book, open, onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    title: book.title ?? "",
    author: book.author ?? "",
    status: book.status ?? Status.TO_READ,
    rating: book.rating ?? null,
    total_pages: book.total_pages ?? null,
    premise: book.premise ?? "",
    review: book.review ?? "",
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(
    book.cover_path ?? null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement | null>(null);
  const firstFieldRef = useRef<HTMLInputElement | null>(null);
  const lastActiveElement = useRef<HTMLElement | null>(null);

  getBookCover(book.id).then((c) => {
    if (c) {
      setCoverPreview(URL.createObjectURL(c));
    }
  });

  useEffect(() => {
    if (!open) return;
    lastActiveElement.current = document.activeElement as HTMLElement | null;
    setTimeout(() => firstFieldRef.current?.focus(), 0);
    return () => {
      if (lastActiveElement.current) lastActiveElement.current.focus();
    };
  }, [open]);

  useEffect(() => {
    // reset form when book prop changes
    setForm({
      title: book.title ?? "",
      author: book.author ?? "",
      status: book.status ?? "",
      rating: book.rating ?? null,
      total_pages: book.total_pages ?? null,
      premise: book.premise ?? "",
      review: book.review ?? "",
    });
    setCoverFile(null);
    setPdfFile(null);
    setCoverPreview(book.cover_path ?? null);
    setError(null);
  }, [book, open]);

  function handleChange<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K]
  ) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  function handleCoverChange(file?: File) {
    if (coverPreview && coverPreview.startsWith("blob:")) {
      URL.revokeObjectURL(coverPreview);
    }
    if (!file) {
      setCoverFile(null);
      setCoverPreview(null);
      return;
    }
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  }

  function handlePdfChange(file?: File) {
    setPdfFile(file ?? null);
  }

  function validate() {
    if (!form.title.trim()) return "Title is required";
    if (
      form.total_pages !== null &&
      form.total_pages !== undefined &&
      form.total_pages < 1
    )
      return "Total pages must be >= 1";
    if (form.rating !== null && (form.rating! < 0 || form.rating! > 5))
      return "Rating must be 0-5";
    return null;
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      if (coverFile || pdfFile) {
        const formData = new FormData();

        if (pdfFile) {
          formData.append("pdf", pdfFile);
          uploadBookPdf(book.id, pdfFile).catch((err) => {
            console.error("Error uploading PDF:", err);
          });
        }

        if (coverFile) {
          formData.append("cover", coverFile);
          uploadBookCover(book.id, coverFile).catch((err) => {
            console.error("Error uploading cover:", err);
          });
        }
      } else {
        const body: Partial<Book> = {
          id: book.id,
          title: form.title,
          author: form.author,
          status: form.status as Status,
          rating: form.rating !== null ? form.rating : undefined,
          totalPages: form.total_pages !== null ? form.total_pages : undefined,
          premise: form.premise,
          review: form.review,
        };
        await updateBook(book.id, body);
      }

      const updated: BookDetail = { ...book, ...form }; // fallback
      onSaved(updated);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") onClose();
    // simple focus trap
    if (e.key === "Tab" && modalRef.current) {
      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled]), textarea, input, select"
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-book-title"
      onKeyDown={handleKeyDown}
    >
      <div
        ref={modalRef}
        className="relative max-w-2xl w-full rounded bg-white shadow-lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 id="edit-book-title" className="text-lg font-semibold">
              Editar libro
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded bg-gray-100 px-3 py-1 text-sm"
                onClick={() => {
                  if (book.pdf_path) window.open(book.pdf_path, "_blank");
                }}
                disabled={!book.pdf_path}
              >
                Ver PDF actual
              </button>
              <button
                type="button"
                aria-label="Cerrar"
                className="ml-2 rounded bg-red-100 px-3 py-1 text-sm"
                onClick={onClose}
              >
                Cerrar
              </button>
            </div>
          </div>

          <div className="p-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="md:col-span-1">
              {coverPreview ? (
                <img
                  src={coverPreview}
                  alt={`${book.title} cover`}
                  className="w-full rounded shadow"
                />
              ) : (
                <div className="w-full h-40 rounded bg-gray-100 flex items-center justify-center text-sm text-gray-500">
                  No cover
                </div>
              )}

              <div className="mt-3">
                <label className="block text-sm font-medium">
                  Cover (imagen)
                </label>
                <input
                  ref={firstFieldRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleCoverChange(
                      e.target.files ? e.target.files[0] : undefined
                    )
                  }
                  className="mt-1"
                />
                <button
                  type="button"
                  className="mt-2 text-sm text-red-600"
                  onClick={() => handleCoverChange(undefined)}
                >
                  Quitar cover
                </button>
              </div>

              <div className="mt-3">
                <label className="block text-sm font-medium">PDF</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) =>
                    handlePdfChange(
                      e.target.files ? e.target.files[0] : undefined
                    )
                  }
                  className="mt-1"
                />
                <div className="mt-2 text-xs text-gray-500">
                  Dejar vacío para mantener el PDF actual
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="grid gap-3">
                <div>
                  <label className="block text-sm font-medium">Título</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    className="mt-1 w-full rounded border px-2 py-1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">Autor</label>
                  <input
                    type="text"
                    value={form.author}
                    onChange={(e) => handleChange("author", e.target.value)}
                    className="mt-1 w-full rounded border px-2 py-1"
                  />
                </div>

                <div className="flex gap-3">
                  <div className="flex-1">
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Status
                      </label>
                      <select
                        value={form.status}
                        onChange={(e) => handleChange("status", e.target.value)}
                        className="w-full rounded border px-3 py-2"
                      >
                        <option value={Status.TO_READ}>Para leer</option>
                        <option value={Status.READING}>Leyendo</option>
                        <option value={Status.READ}>Leido</option>
                      </select>
                    </div>
                  </div>

                  <div className="w-28">
                    <label className="block text-sm font-medium">Páginas</label>
                    <input
                      type="number"
                      min={1}
                      value={form.total_pages ?? ""}
                      onChange={(e) =>
                        handleChange(
                          "total_pages",
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                      className="mt-1 w-full rounded border px-2 py-1"
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-sm font-medium">Rating</label>
                    <input
                      type="number"
                      min={0}
                      max={5}
                      step={0.5}
                      value={form.rating ?? ""}
                      onChange={(e) =>
                        handleChange(
                          "rating",
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                      className="mt-1 w-full rounded border px-2 py-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium">Premisa</label>
                  <textarea
                    value={form.premise}
                    onChange={(e) => handleChange("premise", e.target.value)}
                    className="mt-1 w-full rounded border px-2 py-1"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">Reseña</label>
                  <textarea
                    value={form.review}
                    onChange={(e) => handleChange("review", e.target.value)}
                    className="mt-1 w-full rounded border px-2 py-1"
                    rows={4}
                  />
                </div>

                {error && <div className="text-sm text-red-600">{error}</div>}

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    className="rounded bg-gray-100 px-3 py-1 text-sm"
                    onClick={onClose}
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="rounded bg-blue-600 px-4 py-1 text-sm text-white"
                    disabled={loading}
                  >
                    {loading ? "Guardando..." : "Guardar cambios"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
