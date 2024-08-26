"use client";

import React, { useState, useEffect } from "react";
import instance from "@/infrastructure/config/AxiosConfig";
import { useRouter } from "next/navigation";
import { TablePagination } from "@mui/material";
import { FaUserShield } from "react-icons/fa";
import ROL_COLORES from "./Rol_color";
import { TIMEOUT } from "@/components/Parametros/Parametros";
import { Acceso } from "@/app/(modulos)/seguridad/models/models"

const CrearRol: React.FC = () => {
  const [step, setStep] = useState(1);
  const [nombre, setNombre] = useState("");
  const [color, setColor] = useState(ROL_COLORES[0].valor);
  const [errors, setErrors] = useState({ nombre: false, accesos: false });
  const [accesos, setAccesos] = useState<Acceso[]>([]);
  const [selectedAccesos, setSelectedAccesos] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectAll, setSelectAll] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const filteredAccesos = accesos.filter((acceso) =>
    acceso.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (step === 2) {
      instance
        .get("/security/v1/accesos/")
        .then((response) => {
          setAccesos(response.data.accesos);
        })
        .catch((error) => {
          console.error("Error fetching accesos:", error);
        });
    }
  }, [step]);

  useEffect(() => {
    setSelectAll(selectedAccesos.length === filteredAccesos.length);
  }, [selectedAccesos, filteredAccesos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = {
      nombre: !nombre,
      accesos: step === 2 && selectedAccesos.length === 0,
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
          await instance.post("/security/v1/roles/", {
            nombre,
            is_active: true,
            rol_color: color,
            acceso_ids: selectedAccesos,
          });
          setTimeout(() => {
            setIsSubmitting(false);
            router.push("/seguridad/roles");
          }, TIMEOUT);
        } catch (error) {
          console.error("Error creating rol:", error);
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

  const handleAccesoSelection = (acceso_id: number) => {
    setSelectedAccesos((prevSelectedAccesos) =>
      prevSelectedAccesos.includes(acceso_id)
        ? prevSelectedAccesos.filter((id) => id !== acceso_id)
        : [...prevSelectedAccesos, acceso_id]
    );
    setErrors((prev) => ({ ...prev, accesos: false }));
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedAccesos([]);
    } else {
      setSelectedAccesos(filteredAccesos.map((acceso) => acceso.acceso_id));
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

  const selectedAccesoNames = accesos
    .filter((acceso) => selectedAccesos.includes(acceso.acceso_id))
    .map((acceso) => acceso.nombre);

  return (
    <div className="flex flex-col lg:flex-row bg-gray-100 dark:bg-gray-900 min-h-screen">
      <div className="w-full lg:w-1/4 bg-white dark:bg-boxdark shadow-md p-4 lg:sticky lg:top-0 h-full lg:h-32">
        <ul className="space-y-2">
          <li className={`font-medium ${step === 1 ? "text-blue-700" : "text-gray-500"}`}>
            Paso 1: Detalles del rol
          </li>
          <li className={`font-medium ${step === 2 ? "text-blue-700" : "text-gray-500"}`}>
            Paso 2: Asignar Accesos
          </li>
          <li className={`font-medium ${step === 3 ? "text-blue-700" : "text-gray-500"}`}>
            Paso 3: Revisar y crear
          </li>
        </ul>
      </div>
      <div className="flex-1 flex flex-col items-center">
        <div className="w-full max-w-3xl mt-10 lg:mt-0">
          <div className="rounded-sm border border-stroke bg-white dark:bg-boxdark shadow-default dark:border-strokedark">
            <form onSubmit={handleSubmit}>
              {step === 1 && (
                <div className="p-6.5">
                  <div className="mb-4.5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-100 dark:bg-gray-800 p-5 rounded-md shadow-md w-full">
                      <div className="flex items-center">
                        <FaUserShield className="text-blue-800 dark:text-white mr-3" />
                        <label className="mb-1 block text-sm font-medium text-black dark:text-white flex items-center">
                          Nombre del rol
                        </label>
                      </div>
                      <input
                        type="text"
                        value={nombre}
                        onChange={(e) => {
                          setNombre(e.target.value);
                          setErrors((prev) => ({ ...prev, nombre: false }));
                        }}
                        className={`w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black dark:text-white outline-none transition focus:border-blue-800 active:border-blue-800 dark:border-form-strokedark dark:bg-form-input dark:focus:border-blue-800 ${errors.nombre ? "border-red-500" : ""}`}
                      />
                      {errors.nombre && <span className="text-red-500 text-sm">Campo requerido</span>}
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 p-5 rounded-md shadow-md w-full">
                      <div className="flex items-center">
                        <FaUserShield className="text-blue-800 dark:text-white mr-3" />
                        <label className="mb-1 block text-sm font-medium text-black dark:text-white flex items-center">
                          Color del rol
                        </label>
                      </div>
                      <div className="relative">
                        <div className="flex flex-wrap">
                          {ROL_COLORES.map((colorItem, index) => (
                            <div
                              key={index}
                              onClick={() => setColor(colorItem.valor)}
                              className="w-8 h-8 rounded-full m-1 cursor-pointer"
                              style={{
                                backgroundColor: colorItem.valor,
                                border: color === colorItem.valor ? "2px solid #000" : "none",
                              }}
                            ></div>
                          ))}
                        </div>
                      </div>
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
                  <h3 className="text-lg font-medium text-black dark:text-white mb-4">Accesos</h3>
                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder="Buscar accesos"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black dark:text-white outline-none transition focus:border-blue-800 active:border-blue-800 dark:border-form-strokedark dark:bg-form-input dark:focus:border-blue-800"
                    />
                  </div>
                  <div className="max-w-full overflow-x-auto" style={{ maxHeight: "500px", overflowY: "auto" }}>
                    <table className="w-full table-auto">
                      <thead>
                        <tr className="bg-blue-900 uppercase text-center dark:bg-meta-4">
                          <th className="w-12 px-4 py-4 text-center font-normal text-white dark:text-zinc-100">
                            <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
                          </th>
                          <th className="font-normal text-white border-b border-[#eee] px-4 py-5 dark:text-zinc-100 dark:border-strokedark">
                            Accesos
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-transparent">
                        {filteredAccesos
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((acceso: Acceso) => (
                            <tr
                              key={acceso.acceso_id}
                              className="hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                            >
                              <td className="px-4 py-4 text-black border-b border-[#eee] dark:text-white dark:border-strokedark">
                                <input
                                  type="checkbox"
                                  checked={selectedAccesos.includes(acceso.acceso_id)}
                                  onChange={() => handleAccesoSelection(acceso.acceso_id)}
                                />
                              </td>
                              <td className="text-center px-4 py-4 text-black border-b border-[#eee] dark:text-white dark:border-strokedark">
                                {acceso.nombre}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                  {errors.accesos && <span className="text-red-500 text-sm">Debe seleccionar al menos un acceso</span>}
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredAccesos.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handlePageChange}
                    onRowsPerPageChange={handleRowsPerPageChange}
                    labelRowsPerPage="Filas por página:"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                    sx={{ color: (theme) => (theme.palette.mode === "dark" ? "#ffffff" : "inherit") }}
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
                </div>
              )}
              {step === 3 && (
                <div className="p-6.5">
                  <h3 className="text-lg font-medium text-black dark:text-white mb-4">Resumen</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-100 dark:bg-gray-800 p-5 rounded-md shadow-md overflow-x-auto">
                      <div className="flex items-center">
                        <FaUserShield className="text-blue-800 dark:text-white mr-3" />
                        <p className="text-black dark:text-white">
                          <strong>Nombre del rol:</strong>
                        </p>
                      </div>
                      <p className="text-black dark:text-white">{nombre}</p>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 p-5 rounded-md shadow-md overflow-x-auto">
                      <div className="flex items-center">
                        <FaUserShield className="text-blue-800 dark:text-white mr-3" />
                        <p className="text-black dark:text-white">
                          <strong>Color del rol:</strong>
                        </p>
                      </div>
                      <div className="w-8 h-8 rounded-full" style={{ backgroundColor: color }}></div>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 p-5 rounded-md shadow-md col-span-1 sm:col-span-2 overflow-x-auto">
                      <div className="flex items-center">
                        <FaUserShield className="text-blue-800 dark:text-white mr-3" />
                        <p className="text-black dark:text-white">
                          <strong>Accesos Seleccionados:</strong>
                        </p>
                      </div>
                      <ul className="list-disc list-inside text-black dark:text-white ml-6">
                        {selectedAccesoNames.map((acceso, index) => (
                          <li key={index}>{acceso}</li>
                        ))}
                      </ul>
                    </div>
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
                      {isSubmitting ? "Creando..." : "Crear"}
                    </button>
                  </div>
                  {isSubmitting && <p className="text-black dark:text-white mt-2">Creando rol...</p>}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrearRol;
