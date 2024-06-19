"use client";

import React, { useState } from "react";

const CrearUsuario: React.FC = () => {
  const [step, setStep] = useState(1);
  const [nombre, setNombre] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ nombre: false, displayName: false, email: false, password: false });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = { nombre: !nombre, displayName: !displayName, email: !email, password: !password };
    setErrors(newErrors);

    if (!Object.values(newErrors).includes(true)) {
      if (step === 1) {
        setStep(2);
      } else if (step === 2) {
        setStep(3);
      } else {
        console.log({ nombre, displayName, email, password });
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
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
    setErrors(prev => ({ ...prev, password: false }));
  };

  return (
    <div className="flex flex-col lg:flex-row bg-gray-100 min-h-screen">
      <div className="w-full lg:w-1/4 bg-white shadow-md p-4 lg:sticky lg:top-0 h-full lg:h-32">
        <ul className="space-y-2">
          <li className={`font-medium ${step === 1 ? "text-blue-800" : ""}`}>Paso 1: Detalles de usuario</li>
          <li className={`font-medium ${step === 2 ? "text-blue-800" : ""}`}>Paso 2: Asignar Rol</li>
          <li className={`font-medium ${step === 3 ? "text-blue-800" : ""}`}>Paso 3: Revisar y crear</li>
        </ul>
      </div>
      <div className="flex-1 flex flex-col items-center">
        <div className="w-full max-w-3xl mt-10 lg:mt-0">
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
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
                        onChange={(e) => {
                          setNombre(e.target.value);
                          setErrors(prev => ({ ...prev, nombre: false }));
                        }}
                        className={`w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary ${errors.nombre ? "border-red-500" : ""}`}
                      />
                      {errors.nombre && <span className="text-red-500 text-sm">Campo requerido</span>}
                    </div>

                    <div className="w-full xl:w-1/2">
                      <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => {
                          setDisplayName(e.target.value);
                          setErrors(prev => ({ ...prev, displayName: false }));
                        }}
                        className={`w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary ${errors.displayName ? "border-red-500" : ""}`}
                      />
                      {errors.displayName && <span className="text-red-500 text-sm">Campo requerido</span>}
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
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setErrors(prev => ({ ...prev, email: false }));
                        }}
                        className={`w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary ${errors.email ? "border-red-500" : ""}`}
                      />
                      {errors.email && <span className="text-red-500 text-sm">Campo requerido</span>}
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
                          className={`w-5 flex-1 rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary ${errors.password ? "border-red-500" : ""}`}
                        />
                        <button
                          type="button"
                          onClick={generarPassword}
                          className="ml-2 bg-black px-5 py-3 text-white border border-black hover:bg-zinc-600"
                        >
                          Generar
                        </button>
                      </div>
                      {errors.password && <span className="text-red-500 text-sm">Campo requerido</span>}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    {step > 1 && (
                      <button
                        type="button"
                        onClick={handleBack}
                        className="bg-white px-5 py-3 text-black border border-black hover:bg-gray-200"
                      >
                        Atrás
                      </button>
                    )}
                    <button
                      type="submit"
                      className="w-30 bg-blue-800 px-5 py-3 text-white hover:bg-blue-600"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
              {step === 2 && (
                <div className="p-6.5">
                  <p>Hola Asignar Roles</p>
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="bg-white px-5 py-3 text-black border border-black hover:bg-zinc-100"
                    >
                      Atrás
                    </button>
                    <button
                      type="submit"
                      className="w-30 bg-blue-800 px-5 py-3 text-white hover:bg-blue-600"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
              {step === 3 && (
                <div className="p-6.5">
                  <p>Hola Revisar y Crear</p>
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="bg-white px-5 py-3 text-black border border-black hover:bg-zinc-100"
                    >
                      Atrás
                    </button>
                    <button
                      type="submit"
                      className="w-30 bg-blue-800 px-5 py-3 text-white hover:bg-blue-600"
                    >
                      Crear
                    </button>
                  </div>
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
