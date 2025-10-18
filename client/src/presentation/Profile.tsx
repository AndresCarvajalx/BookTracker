import { useState } from "react";

export function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState("Andres Felipe Carvajal");

  const handleEditClick = () => {
    if (isEditing) {
      // Aquí puedes guardar en backend si es necesario
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
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          ) : (
            <p className="text-xl font-bold">{username}</p>
          )}

          <button
            onClick={handleEditClick}
            className="text-sm bg-(--green-color) hover:bg-(--color-primary-hover) text-white px-3 py-1 rounded-md transition"
          >
            {isEditing ? "Guardar" : "Editar"}
          </button>
        </div>

        <p className="text-md mb-4 font-light text-(--color-text-secondary)">
          andresfelipe@gmail.com
        </p>

        <div className="grid grid-cols-3 gap-4 mt-4 w-full">
          <StatCard label="Leídos" count={32} color="bg-(--gold-color)" />
          <StatCard label="Por leer" count={15} color="bg-(--gold-color)" />
          <StatCard label="Leyendo" count={4} color="bg-(--gold-color)" />
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
