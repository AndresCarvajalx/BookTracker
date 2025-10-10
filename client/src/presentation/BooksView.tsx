// src/pages/BooksView.tsx
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  deleteBook,
  getBookById,
  getBookCover,
  getBookPdf,
  getBooks,
} from "../api/books";
import { Status, type Book, type BookDetail } from "../types";
import BookEditModal from "./components/BookEditModal";
import ErrorBanner from "./components/ErrorBanner";
import SpineBook from "./components/SpineBook";

interface BookViewProp {
  filter?: Status;
}

export function BooksView({ filter = Status.READ }: BookViewProp) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<BookDetail | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [coverBlobUrl, setCoverBlobUrl] = useState<string | null>(null);

  const userId = "1";

  const [editOpen, setEditOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<BookDetail | null>(null);

  function openEdit(book: BookDetail) {
    setEditingBook(book);
    setEditOpen(true);
  }

  function handleSaved(updated: BookDetail) {
    // TODO
    books.map((b) => (b.id === updated.id ? { ...b, ...updated } : b));
    setBooks(books);
    setEditOpen(false);
    setEditingBook(null);
  }

  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);
    setError(null);

    getBooks()
      .then(setBooks)
      .catch((err) => {
        if (err.name === "AbortError") return;
        console.error("Error fetching books:", err);
        setError(err.message || "Failed to load books");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [userId]);

  const filteredBooks = useMemo(() => {
    if (!filter || filter === Status.ALL) return books;
    return books.filter((b) => String(b.status) === String(filter));
  }, [books, filter]);

  const openBookModal = useCallback((bookId: number) => {
    setModalOpen(true);
    setDetailLoading(true);
    setDetailError(null);
    setSelectedBook(null);

    const controller = new AbortController();

    getBookById(bookId)
      .then((data: BookDetail) => {
        setSelectedBook(data);
        return fetchPdfForBook(bookId);
      })
      .then((blobUrl) => {
        if (blobUrl) setPdfBlobUrl(blobUrl);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        console.error("Error fetching book detail/pdf:", err);
        setDetailError(err.message || "Failed to load book detail");
      })
      .finally(() => setDetailLoading(false));

    fetchCoverForBook(bookId).then((blobUrl) => {
      console.log(blobUrl);
      if (blobUrl) setCoverBlobUrl(blobUrl);
    });
    return () => controller.abort();
  }, []);

  async function fetchCoverForBook(bookId: number) {
    const coverBlob = await getBookCover(bookId);
    if (coverBlob) {
      return URL.createObjectURL(coverBlob);
    }
  }

  async function fetchPdfForBook(bookId: number) {
    const pdfBlob = await getBookPdf(bookId);
    if (pdfBlob) {
      return URL.createObjectURL(pdfBlob);
    }
    return null;
  }

  const closeModal = () => {
    setModalOpen(false);
    setSelectedBook(null);
    setDetailError(null);
    setDetailLoading(false);
    if (pdfBlobUrl && pdfBlobUrl.startsWith("blob:")) {
      URL.revokeObjectURL(pdfBlobUrl);
    }
    if (coverBlobUrl && coverBlobUrl.startsWith("blob:")) {
      URL.revokeObjectURL(coverBlobUrl);
    }
    setCoverBlobUrl(null);
    setPdfBlobUrl(null);
  };

  const onDelete = (bookId: number) => {
    deleteBook(bookId)
      .then(() => {
        setBooks(books.filter((b) => b.id !== bookId));
        closeModal();
      })
      .catch((err) => {
        console.error("Error deleting book:", err);
        setDetailError(err.message || "Failed to delete book");
      });
  };

  return (
    <section className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mi Biblioteca Personal</h1>
      </div>

      {loading && <p className="text-sm text-gray-500">Loading books...</p>}
      {error && <ErrorBanner error={error} />}

      {!loading && filteredBooks.length === 0 && !error && (
        <p className="text-gray-600">No books match this filter.</p>
      )}

      <div className="mt-4 flex gap-2 overflow-x-auto py-4 items-end">
        {filteredBooks.map((book) => (
          <div
            key={book.id}
            className="flex flex-col items-center min-w-[56px] cursor-pointer"
            onClick={() => openBookModal(book.id)}
          >
            <SpineBook
              id={book.id}
              title={book.title}
              rating={typeof book.rating === "number" ? book.rating : undefined}
              className="transition-transform hover:scale-105"
            />
            <div className="mt-2 w-28 text-center">
              <div className="text-xs font-medium text-gray-800 truncate">
                {book.title}
              </div>
              <div className="text-[10px] text-gray-500 truncate">
                by {book.author ?? "—"}
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative max-w-4xl w-full rounded bg-white shadow-lg">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <h3 className="text-lg font-semibold">
                  {selectedBook ? selectedBook.title : "Loading..."}
                </h3>
                <p className="text-sm text-gray-500">{selectedBook?.author}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onDelete(selectedBook!.id)}
                  className="rounded bg-red-200 px-3 py-1 text-sm"
                >
                  eliminar
                </button>

                <button
                  onClick={() => openEdit(selectedBook!)}
                  className="rounded bg-green-100 px-3 py-1 text-sm"
                >
                  Editar
                </button>

                <button
                  className="rounded bg-gray-100 px-3 py-1 text-sm"
                  onClick={() => {
                    if (pdfBlobUrl) window.open(pdfBlobUrl, "_blank");
                  }}
                  disabled={!pdfBlobUrl}
                >
                  Abrir PDF
                </button>
                <button
                  aria-label="Close"
                  className="ml-2 rounded bg-red-100 px-3 py-1 text-sm"
                  onClick={closeModal}
                >
                  Cerrar
                </button>
              </div>
            </div>

            <div className="p-4">
              {detailLoading && <p>Loading detail...</p>}
              {detailError && <ErrorBanner error={detailError} />}

              {!detailLoading && selectedBook && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="md:col-span-1">
                    {coverBlobUrl ? (
                      <img
                        src={coverBlobUrl}
                        alt={selectedBook?.title ?? "Cover"}
                        className="w-full rounded shadow"
                      />
                    ) : (
                      <></>
                    )}
                    <div className="mb-3 text-sm text-gray-600">
                      Estado: {selectedBook.status}
                    </div>
                    <div className="mb-3 text-sm text-gray-600">
                      Páginas: {selectedBook.total_pages ?? "—"}
                    </div>
                    <div className="mb-3 text-sm text-gray-600">
                      Calificación: {selectedBook.rating ?? "—"}
                    </div>
                    <div className="mb-3 text-sm text-gray-600">
                      Agregado: {selectedBook.created_at ?? "—"}
                    </div>
                    <div className="mb-3 text-sm text-gray-700">
                      {selectedBook.premise ?? selectedBook.review ?? ""}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <div className="h-[70vh] w-full border">
                      {pdfBlobUrl ? (
                        <embed
                          src={pdfBlobUrl}
                          type="application/pdf"
                          width="100%"
                          height="100%"
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-4 text-center text-sm text-gray-500">
                          <div>No PDF available</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {editingBook && (
        <BookEditModal
          book={editingBook}
          open={editOpen}
          onClose={() => setEditOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </section>
  );
}

export default BooksView;
