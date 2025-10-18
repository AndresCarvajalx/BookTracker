import { useEffect, useState } from "react";
import { getBooks } from "../api/books";
import { getUser } from "../api/user";
import type { User } from "../types";

// TODO : Implement profile editing functionality
export function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState({ read: 0, to_read: 0, reading: 0 });

  useEffect(() => {
    getUser()
      .then((data) => setUser(data))
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
    if (isEditing) {
    }
    setIsEditing(!isEditing);
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Perfil de Usuario</h1>

      <div className="flex flex-col items-center bg-(--color-surface) p-6 rounded-lg shadow-md">
        <div className="flex items-center gap-2 mb-2">
          {isEditing ? (
            <input
              className="border border-(--color-border) rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
              value={user?.username}
              onChange={(e) => {}}
            />
          ) : (
            <p className="text-xl font-bold">{user?.username}</p>
          )}

          <button
            onClick={handleEditClick}
            className="text-sm bg-(--green-color) hover:bg-(--color-primary-hover) text-white px-3 py-1 rounded-md transition"
          >
            {isEditing ? "Guardar" : "Editar"}
          </button>
        </div>

        <p className="text-md mb-4 font-light text-(--color-text-secondary)">
          ${user?.email}
        </p>

        <div className="grid grid-cols-3 gap-4 mt-4 w-full">
          <StatCard
            label="Leídos"
            count={stats.read}
            color="bg-(--gold-color)"
          />
          <StatCard
            label="Por leer"
            count={stats.to_read}
            color="bg-(--gold-color)"
          />
          <StatCard
            label="Leyendo"
            count={stats.reading}
            color="bg-(--gold-color)"
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
