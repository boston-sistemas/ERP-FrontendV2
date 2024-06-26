"use client";

import React, { useState, useEffect } from "react";
import instance from "@/config/AxiosConfig";
import { useRouter } from 'next/navigation';
import { TablePagination } from "@mui/material";

interface Acceso {
  acceso_id: number;
  nombre: string;
  is_active: boolean;
}

interface Rol {
  rol_id: number;
  nombre: string;
  is_active: boolean;
  accesos: Acceso[];
}

const CrearUsuario: React.FC = () => {
  const [step, setStep] = useState(1);
  const [nombre, setNombre] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ nombre: false, displayName: false, email: false, password: false, roles: false });
  const [roles, setRoles] = useState<Rol[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectAll, setSelectAll] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const filteredRoles = roles.filter(rol =>
    rol.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (step === 2) {
      instance.get("/security/v1/roles/")
        .then(response => {
          setRoles(response.data.roles);
        })
        .catch(error => {
          console.error("Error fetching roles:", error);
        });
    }
  }, [step]);

  useEffect(() => {
    setSelectAll(selectedRoles.length === filteredRoles.length);
  }, [selectedRoles, filteredRoles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = { 
      nombre: !nombre, 
      displayName: !displayName, 
      email: !email, 
      password: !password, 
      roles: step === 2 && selectedRoles.length === 0 
    };
    setErrors(newErrors);

    if (!Object.values(newErrors).includes(true)) {
      if (step === 1) {
        setStep(2);
      } else if (step === 2) {
        setStep(3);
      } else {
        setIsSubmitting(true);
        try {
          await instance.post('/security/v1/usuarios/', {
            username: nombre,
            email,
            display_name: displayName,
            is_active: true,
            password,
            rol_ids: selectedRoles
          });
          setIsSubmitting(false);
          router.push('/seguridad/usuarios');
        } catch (error) {
          console.error("Error creating user:", error);
          setIsSubmitting(false);
        }
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const generarPassword = () => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";
    const length = 16;
    let generatedPassword = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      generatedPassword += charset[randomIndex];
    }
    setPassword(generatedPassword);
    setErrors(prev => ({ ...prev, password: false }));
  };

  const handleRoleSelection = (rol_id: number) => {
    setSelectedRoles(prevSelectedRoles =>
      prevSelectedRoles.includes(rol_id)
        ? prevSelectedRoles.filter(id => id !== rol_id)
        : [...prevSelectedRoles, rol_id]
    );
    setErrors(prev => ({ ...prev, roles: false }));  // Clear role selection error when a role is selected
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRoles([]);
    } else {
      setSelectedRoles(filteredRoles.map(rol => rol.rol_id));
    }
    setSelectAll(!selectAll);
  };

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const selectedRoleNames = roles.filter(rol => selectedRoles.includes(rol.rol_id)).map(rol => rol.nombre);

  return (
    <div className="flex flex-col lg:flex-row bg-gray-100 dark:bg-gray-900 min-h-screen">
      <div className="w-full lg:w-1/4 bg-gray-200 dark:bg-gray-700 shadow-md p-4 lg:sticky lg:top-0 h-full lg:h-32">
        <ul className="space-y-2">
          <li className={`font-medium ${step === 1 ? "text-white" : "text-gray-500"}`}>Paso 1: Detalles de usuario</li>
          <li className={`font-medium ${step === 2 ? "text-white" : "text-gray-500"}`}>Paso 2: Asignar Rol</li>
          <li className={`font-medium ${step === 3 ? "text-white" : "text-gray-500"}`}>Paso 3: Revisar y crear</li>
        </ul>
      </div>
      <div className="flex-1 flex flex-col items-center">
        <div className="w-full max-w-3xl mt-10 lg:mt-0">
          <div className="rounded-sm border border-stroke bg-white dark:bg-boxdark shadow-default dark:border-strokedark">
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
                        className={`w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black dark:text-white outline-none transition focus:border-blue-800 active:border-blue-800 dark:border-form-strokedark dark:bg-form-input dark:focus:border-blue-800 ${errors.nombre ? "border-red-500" : ""}`}
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
                        className={`w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black dark:text-white outline-none transition focus:border-blue-800 active:border-blue-800 dark:border-form-strokedark dark:bg-form-input dark:focus:border-blue-800 ${errors.displayName ? "border-red-500" : ""}`}
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
                        className={`w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black dark:text-white outline-none transition focus:border-blue-800 active:border-blue-800 dark:border-form-strokedark dark:bg-form-input dark:focus:border-blue-800 ${errors.email ? "border-red-500" : ""}`}
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
                          className={`w-5 flex-1 rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black dark:text-white outline-none transition focus:border-blue-800 active:border-blue-800 dark:border-form-strokedark dark:bg-form-input dark:focus:border-blue-800 ${errors.password ? "border-red-500" : ""}`}
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
                        className="bg-black text-white px-5 py-3 border border-black hover:bg-gray-200 dark:hover:bg-gray-600"
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
                  <h3 className="text-lg font-medium text-black dark:text-white mb-4">Permisos</h3>
                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder="Buscar roles"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black dark:text-white outline-none transition focus:border-blue-800 active:border-blue-800 dark:border-form-strokedark dark:bg-form-input dark:focus:border-blue-800"
                    />
                  </div>
                  <div className="max-w-full overflow-x-auto" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    <table className="w-full table-auto">
                      <thead>
                        <tr className="bg-blue-900 uppercase text-center dark:bg-meta-4">
                          <th className="w-12 px-6 py-3 border-b-2 border-gray-200 bg-gray-50 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                            <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
                          </th>
                          <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-50 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                            Nombre del Rol
                          </th>
                          <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-50 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                            Accesos
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800">
                        {filteredRoles.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((rol: Rol) => (
                          <tr key={rol.rol_id}>
                            <td className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                              <input
                                type="checkbox"
                                checked={selectedRoles.includes(rol.rol_id)}
                                onChange={() => handleRoleSelection(rol.rol_id)}
                              />
                            </td>
                            <td className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">{rol.nombre}</td>
                            <td className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                              <ul className="list-disc list-inside">
                                {rol.accesos.map(acceso => (
                                  <li key={acceso.acceso_id}>{acceso.nombre}</li>
                                ))}
                              </ul>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {errors.roles && <span className="text-red-500 text-sm">Debe seleccionar al menos un rol</span>}
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredRoles.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handlePageChange}
                    onRowsPerPageChange={handleRowsPerPageChange}
                    labelRowsPerPage="Filas por página:"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                    sx={{ color: 'text.secondary' }}
                  />
                  <div className="flex justify-between mt-4">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="bg-black text-white px-5 py-3 border border-black hover:bg-gray-200 dark:hover:bg-gray-600"
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
                  <div className="mt-4">
                    <button
                      type="button"
                      className="bg-black text-white px-5 py-3 border border-black hover:bg-gray-200 dark:hover:bg-gray-600"
                      onClick={() => window.location.href = '/crearrol'}
                    >
                      ¿No encuentras un rol adecuado? Prueba con crearrol/
                    </button>
                  </div>
                </div>
              )}
              {step === 3 && (
                <div className="p-6.5">
                  <h3 className="text-lg font-medium text-black dark:text-white mb-4">Resumen</h3>
                  <div className="bg-gray-100 dark:bg-gray-800 p-5 rounded-md shadow-md">
                    <p className="text-black dark:text-white mb-2"><strong>Nombre:</strong> {nombre}</p>
                    <p className="text-black dark:text-white mb-2"><strong>Display Name:</strong> {displayName}</p>
                    <p className="text-black dark:text-white mb-2"><strong>Email:</strong> {email}</p>
                    <p className="text-black dark:text-white mb-2"><strong>Password:</strong> {password}</p>
                    <p className="text-black dark:text-white mb-2"><strong>Roles Seleccionados:</strong></p>
                    <ul className="list-disc list-inside text-black dark:text-white">
                      {selectedRoleNames.map((role, index) => (
                        <li key={index}>{role}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex justify-between mt-4">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="bg-black text-white px-5 py-3 border border-black hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      Atrás
                    </button>
                    <button
                      type="submit"
                      className="w-30 bg-blue-800 px-5 py-3 text-white hover:bg-blue-600"
                      disabled={isSubmitting}
                    >
                      Crear
                    </button>
                  </div>
                  {isSubmitting && <p className="text-black dark:text-white mt-2">Creando usuario...</p>}
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
