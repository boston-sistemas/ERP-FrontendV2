"use client";

import React, { useState } from "react";

const CrearUsuario: React.FC = () => {
  const [step, setStep] = useState(1);
  const [nombre, setNombre] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else {
      console.log({ nombre, displayName, email, password });
    }
  };

  const generarPassword = () => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
    const length = 16;
    let generatedPassword = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      generatedPassword += charset[randomIndex];
    }
    setPassword(generatedPassword);
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <div className="w-1/4 bg-white shadow-md p-4">
        <ul className="space-y-2">
          <li className={`font-medium ${step === 1 ? "text-blue-800" : ""}`}>Paso 1: Detalles de usuario</li>
          <li className={`font-medium ${step === 2 ? "text-blue-800" : ""}`}>Paso 2: Asignar Rol</li>
          <li className={`font-medium ${step === 3 ? "text-blue-800" : ""}`}>Paso 3: Revisar y crear</li>
        </ul>
      </div>
      <div className="flex-1 mt-20 flex justify-center items-center">
        <div className="w-full max-w-3xl">
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                {step === 1 && "Crear Usuario"}
                {step === 2 && "Asignar Rol"}
                {step === 3 && "Revisar y crear"}
              </h3>
            </div>
            <form onSubmit={handleSubmit}>
              {step === 1 && (
                <div className="p-6.5">
                  <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                    <div className="w-full xl:w-1/2">
                      <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                        Nombre
                      </label>
                      <input
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      />
                    </div>

                    <div className="w-full xl:w-1/2">
                      <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                    <div className="w-full xl:w-1/2">
                      <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                        Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      />
                    </div>

                    <div className="w-full xl:w-1/2">
                      <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                        Password
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          value={password}
                          readOnly
                          placeholder="Generar contraseña"
                          className="flex-1 rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        />
                        <button
                          type="button"
                          onClick={generarPassword}
                          className="ml-2 rounded bg-blue-800 px-5 py-3 text-white hover:bg-blue-600"
                        >
                          Generar
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-4 flex justify-center rounded bg-blue-800 p-3 font-medium text-white hover:bg-blue-600"
                  >
                    Siguiente
                  </button>
                </div>
              )}
              {step === 2 && (
                <div className="p-6.5">
                  <p>Hola Asignar Roles</p>
                  <button
                    type="submit"
                    className="w-full mt-4 flex justify-center rounded bg-blue-800 p-3 font-medium text-white hover:bg-blue-600"
                  >
                    Siguiente
                  </button>
                </div>
              )}
              {step === 3 && (
                <div className="p-6.5">
                  <p>Hola Revisar y Crear</p>
                  <button
                    type="submit"
                    className="w-full mt-4 flex justify-center rounded bg-blue-800 p-3 font-medium text-white hover:bg-blue-600"
                  >
                    Crear
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrearUsuario;
