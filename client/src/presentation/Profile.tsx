import { useEffect, useState } from "react";
import { getBooks } from "../api/books";
import { getUser, updateUser } from "../api/user";
import type { User } from "../types";

export function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [originalUser, setOriginalUser] = useState<User | null>(null);
  const [stats, setStats] = useState({ read: 0, to_read: 0, reading: 0 });

  useEffect(() => {
    getUser()
      .then((data) => {
        setUser(data);
        setOriginalUser(data);
      })
      .catch((err) => console.error("Error fetching user:", err));

    getBooks()
      .then((books) => {
        const newStats = {
          read: books.filter((b) => b.status === "read").length,
          to_read: books.filter((b) => b.status === "to_read").length,
          reading: books.filter((b) => b.status === "reading").length,
        };
        setStats(newStats);
      })
      .catch((err) => console.error("Error fetching books:", err));
  }, []);

  const handleEditClick = () => {
    if (isEditing && user) {
      updateUser(user)
        .then((updatedUser) => {
          setUser(updatedUser);
          setOriginalUser(updatedUser);
          setIsEditing(false);
        })
        .catch((err) => console.error("Error updating user:", err));
    } else {
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setUser(originalUser);
    setIsEditing(false);
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Perfil de Usuario</h1>

      <div className="flex flex-col items-center bg-[var(--color-surface)] p-6 rounded-lg shadow-md">
        <div className="flex items-center gap-2 mb-2">
          {isEditing ? (
            <input
              className="border border-[var(--color-border)] rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              value={user?.username ?? ""}
              onChange={(e) =>
                setUser((prev) =>
                  prev ? { ...prev, username: e.target.value } : prev
                )
              }
            />
          ) : (
            <p className="text-xl font-bold">{user?.username}</p>
          )}

          <button
            onClick={handleEditClick}
            className="text-sm bg-[var(--green-color)] hover:bg-[var(--color-primary-hover)] text-white px-3 py-1 rounded-md transition"
          >
            {isEditing ? "Guardar" : "Editar"}
          </button>

          {isEditing && (
            <button
              onClick={handleCancel}
              className="text-sm bg-red-400 hover:bg-red-500 text-white px-3 py-1 rounded-md transition"
            >
              Cancelar
            </button>
          )}
        </div>

        <p className="text-md mb-4 font-light text-[var(--color-text-secondary)]">
          {user?.email}
        </p>

        <div className="grid grid-cols-3 gap-4 mt-4 w-full">
          <StatCard
            label="Leídos"
            count={stats.read}
            color="bg-[var(--gold-color)]"
          />
          <StatCard
            label="Por leer"
            count={stats.to_read}
            color="bg-[var(--gold-color)]"
          />
          <StatCard
            label="Leyendo"
            count={stats.reading}
            color="bg-[var(--gold-color)]"
          />
        </div>
      </div>
    </>
  );
}

function StatCard({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-4 rounded-md text-white ${color}`}
    >
      <span className="text-2xl font-bold">{count}</span>
      <span className="text-sm">{label}</span>
    </div>
  );
}
