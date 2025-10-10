import React, { useEffect, useState } from "react";
import ErrorBanner from "./ErrorBanner";

interface SpineBookProps {
  id: number | string;
  title: string;
  rating?: number;
  fetchRating?: boolean;
  onClick?: (id: number | string) => void;
  className?: string;
  spineColor?: string;
  textColor?: string;
}

export default function SpineBook({
  id,
  title,
  rating: ratingProp,
  fetchRating = false,
  onClick,
  className = "",
  spineColor,
  textColor,
}: SpineBookProps) {
  const [rating, setRating] = useState<number | null>(
    typeof ratingProp === "number" ? ratingProp : null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (fetchRating && ratingProp == null) {
      setLoading(true);
      fetch(`/api/books/${id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch rating");
          return res.json();
        })
        .then((data) => {
          if (typeof data.rating === "number") setRating(data.rating);
          else setError("rating missing");
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [fetchRating, id, ratingProp]);

  const effectiveRating = typeof ratingProp === "number" ? ratingProp : rating;

  function handleActivate() {
    if (onClick) onClick(id);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleActivate();
    }
  }

  const spineBgClass = spineColor || "bg-primary";
  const titleTextClass = textColor || "text-surface";

  return (
    <>
      {error && <ErrorBanner error={error} />}

      <div
        role="button"
        tabIndex={0}
        onClick={handleActivate}
        onKeyDown={handleKeyDown}
        className={`relative flex items-center justify-center cursor-pointer select-none ${className}`}
        aria-label={`Open book ${title}`}
      >
        {/* Spine container */}
        <div
          className={`flex h-56 w-14 items-center justify-center rounded-md shadow-sm ${spineBgClass}`}
          style={{
            // ensure the spine has a book-like aspect ratio and a subtle border
            border: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          {/* Title rotated -90deg so it reads vertically along the spine */}
          <div className="flex items-center justify-center">
            <span
              className={`-rotate-90 whitespace-nowrap text-sm font-semibold ${titleTextClass} px-1 transform origin-center`}
              style={{ maxWidth: "10rem" }}
              title={title}
            >
              {title}
            </span>
          </div>
        </div>

        {/* Vertical rating on the left side of the spine (writing-mode vertical) */}
        <div
          className="absolute left-0 -translate-x-1/2 flex items-center justify-center"
          style={{ height: "100%" }}
        >
          <div
            className="flex flex-col items-center text-xs font-medium"
            style={{ writingMode: "vertical-rl" }}
          >
            {loading ? (
              <span aria-hidden>…</span>
            ) : effectiveRating != null ? (
              // show rating as stars + numeric value
              <>
                {/* Stars + numeric rating inside the spine (bottom center) */}
                <div className="absolute left-1/2  flex items-center gap-1 rounded-full bg-yellow-50/80 px-1 py-0.5">
                  <div className="flex items-center" aria-hidden>
                    {renderStars(
                      effectiveRating ?? 0,
                      "text-yellow-400 w-3 h-3"
                    )}
                  </div>
                  <div className="text-[10px] font-medium text-yellow-800 -rotate-90 ">
                    {effectiveRating != null ? effectiveRating.toFixed(1) : "—"}
                  </div>
                </div>
              </>
            ) : (
              <span className="opacity-70"></span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
function renderStars(value: number, cls = "text-yellow-400 w-3 h-3") {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  const stars = [] as React.ReactNode[];
  for (let i = 0; i < 5; i++) {
    if (i < full) {
      stars.push(
        <svg
          key={i}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className={cls}
          fill="currentColor"
        >
          <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L19.8 24 12 19.897 4.2 24l1.998-8.69L.498 9.75l7.732-1.732L12 .587z" />
        </svg>
      );
    } else if (i === full && half) {
      stars.push(
        <svg
          key={i}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className={cls + " opacity-90"}
          fill="currentColor"
        >
          <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L19.8 24 12 19.897 4.2 24l1.998-8.69L.498 9.75l7.732-1.732L12 .587z" />
        </svg>
      );
    } else {
      stars.push(
        <svg
          key={i}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className={cls + " opacity-40"}
          fill="currentColor"
        >
          <path d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L19.8 24 12 19.897 4.2 24l1.998-8.69L.498 9.75l7.732-1.732L12 .587z" />
        </svg>
      );
    }
  }
  return <span className="flex items-center">{stars}</span>;
}
