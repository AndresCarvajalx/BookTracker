/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import ErrorBanner from "./components/ErrorBanner";
import LoadingScreen from "./components/LoadingScreen";

import reactLogo from "../assets/react.svg";
import { login } from "../api/auth";

export function Login() {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = ({
    target: { name, value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [name]: value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const data = await login(user.email, user.password);
      localStorage.setItem("token", data.token);
      navigate("/");
    } catch (error: any) {
      console.error("Error logging in:", error);
      setError(error.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      {error && <ErrorBanner error={error} />}

      <section className="flex items-center justify-center min-h-screen bg-[--color-bg]">
        <div className="container h-full p-10">
          <div className="g-6 flex h-full flex-wrap items-center justify-center text-neutral-800 light:text-neutral-200">
            <div className="w-full">
              <div className="block rounded-lg bg-white shadow-lg light:bg-neutral-800">
                <div className="g-0 lg:flex lg:flex-wrap">
                  {/* <!-- Left column container--> */}
                  <div className="px-4 md:px-0 lg:w-6/12">
                    <div className="md:mx-6 md:p-12">
                      {/* <!--Logo--> */}
                      <div className="text-center">
                        <img
                          className="mx-auto w-28"
                          src={reactLogo}
                          alt="logo unitropico"
                        />
                        <h4 className="mb-12 mt-1 pb-1 text-3xl font-bold">
                          BookTracker
                        </h4>
                      </div>

                      <form onSubmit={handleSubmit}>
                        <p className="mb-4">Por favor inicia sesion</p>

                        <input
                          type="email"
                          name="email"
                          className="w-full mb-4 rounded border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-(--green-color)"
                          placeholder="example@example.com"
                          onChange={handleChange}
                          required
                        />

                        <input
                          type="password"
                          name="password"
                          className="w-full mb-4 rounded border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-(--green-color)"
                          placeholder="Contraseña"
                          onChange={handleChange}
                          required
                        />

                        <div className="mb-12 pb-1 pt-1 text-center">
                          <button
                            className="mb-3 bg-(--color-primary) inline-block w-full rounded px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_rgba(0,0,0,0.2)] transition duration-150 ease-in-out hover:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)] focus:outline-none focus:ring-0 active:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)]"
                            type="submit"
                          >
                            Iniciar Sesion
                          </button>
                        </div>

                        {/* <!--Register button--> */}
                        <div className="flex items-center justify-between pb-6">
                          <p className="mb-0 mr-2">No tienes cuenta?</p>
                          <Link
                            to="/signup"
                            className="rounded border-2 border-(--gold-color) px-6 py-2 text-xs font-semibold uppercase text-(--gold-color) transition-colors duration-200 hover:bg-(--gold-color) hover:text-white"
                          >
                            Crear Cuenta
                          </Link>
                        </div>
                      </form>
                    </div>
                  </div>

                  {/* <!-- Right column container with background and description--> */}
                  <div className="flex items-center rounded-b-lg lg:w-6/12 lg:rounded-r-lg lg:rounded-bl-none bg-(--color-bg) ">
                    <div className="px-4 py-6 text-white md:mx-6 md:p-12">
                      <h4 className="mb-4 text-xl font-semibold text-(--color-text)">
                        BookTracker Biblioteca Personal
                      </h4>
                      <p className="text-sm text-amber-950 text-justify">
                        BookTracker es una herramienta diseñada para ayudarte a
                        organizar y gestionar tu biblioteca personal. Con esta
                        aplicación, puedes llevar un registro de los libros que
                        posees, los que has leído y los que planeas leer.
                        Además, te permite explorar detalles sobre tus libros
                        favoritos y mantener un historial de tus lecturas.
                        ¡Descubre una forma más sencilla y eficiente de
                        disfrutar de tu pasión por la lectura!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
