import {
  FaBook,
  FaBookmark,
  FaBookReader,
  FaPlusCircle,
  FaReadme,
  FaUser,
} from "react-icons/fa";

import { useState } from "react";

import { Status, View } from "../types";
import { AddBookView } from "./AddBookView";
import { BooksView } from "./BooksView";
import SideBar from "./components/SideBar";

const menu: { label: string; key: View; icon: React.ReactNode }[] = [
  { label: "Libros", key: View.Libros, icon: <FaBook /> },
  { label: "Leidos", key: View.Leidos, icon: <FaReadme /> },
  { label: "Por Leer", key: View.PorLeer, icon: <FaBookmark /> },
  { label: "Leyendo", key: View.Leyendo, icon: <FaBookReader /> },
  { label: "Agregar", key: View.Agregar, icon: <FaPlusCircle /> },
  { label: "Perfil", key: View.Perfil, icon: <FaUser /> },
];

export function Home() {
  const [activeView, setActiveView] = useState<View>(View.Libros);

  const renderContent = () => {
    switch (activeView) {
      case View.Libros:
        return <BooksView filter={Status.ALL} />;
      case View.Leidos:
        return <BooksView filter={Status.READ} />;
      case View.PorLeer:
        return <BooksView filter={Status.TO_READ} />;
      case View.Leyendo:
        return <BooksView filter={Status.READING} />;
      case View.Agregar:
        return <AddBookView view={setActiveView} />;
      case View.Perfil:
        return <>Perfil</>;
      default:
        return <div>Selecciona una opción</div>;
    }
  };

  return (
    <div className="flex h-screen">
      <SideBar
        activeView={activeView}
        setActiveView={setActiveView}
        menu={menu}
      />
      <main className="flex-1 p-6 bg-(--color-bg) overflow-auto">
        <div className="p-4 space-y-4">{renderContent()}</div>
      </main>
    </div>
  );
}
