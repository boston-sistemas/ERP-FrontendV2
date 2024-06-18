"use client";

import React, { useState, useEffect } from "react";
import instance from "@/config/AxiosConfig";
import Image from "next/image";
import { TablePagination, IconButton, Typography, Button } from "@mui/material";
import { Edit, Visibility } from "@mui/icons-material";
import "@/css/checkbox.css";

interface Usuario {
  usuario_id: number;
  username: string;
  email: string;
  display_name: string;
  is_active: boolean;
  blocked_until: string;
  roles: string[];
}

const Usuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(10);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const response = await instance.get('/security/v1/usuarios/');
      setUsuarios(response.data.usuarios);
    } catch (error) {
      console.error('Error fetching users', error);
      setError('Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleCambiarPagina = (event: any, newPage: any) => {
    setPagina(newPage);
  };

  const handleCambiarFilasPorPagina = (event: any) => {
    setFilasPorPagina(parseInt(event.target.value, 10));
    setPagina(0);
  };

  const handleCrearUsuario = () => {
    // Implementar la función para crear un usuario
    console.log("Crear usuario");
  };

  return (
    <div className="space-y-5">
      {error && (
        <div className="text-red-500">{error}</div>
      )}
      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <Typography variant="h5" className="text-black dark:text-white mb-4">Usuarios</Typography>
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-blue-900 uppercase text-center dark:bg-meta-4">
                {["Foto", "Nombre", "Correo", "Roles", "Último Inicio Sesión", "Estado", "Permisos", "Editar"].map((column, index) => (
                  <th key={index} className="px-4 py-4 text-center font-normal text-white dark:text-zinc-100">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="pt-5 pb-5 text-center text-black dark:text-white">
                    Cargando...
                  </td>
                </tr>
              ) : usuarios.length === 0 ? (
                <tr>
                  <td colSpan={8} className="pt-5 pb-5 text-center text-black dark:text-white">
                    No existen usuarios
                  </td>
                </tr>
              ) : (
                usuarios.slice(pagina * filasPorPagina, pagina * filasPorPagina + filasPorPagina).map(usuario => (
                  <tr key={usuario.usuario_id} className="text-center">
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      <Image src="/images/user/user-default.png" alt="User" width={40} height={40} className="rounded-full mx-auto" />
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      <Typography variant="body1" className="text-black dark:text-white">{usuario.display_name}</Typography>
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      <Typography variant="body2" className="text-black dark:text-white">{usuario.email}</Typography>
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      {usuario.roles.length > 0 ? (
                        usuario.roles.map((role, index) => (
                          <span
                            key={index}
                            className={`inline-block px-2 py-1 text-xs font-medium text-white ${role === "Produccion" ? "bg-blue-500" : role === "Operaciones" ? "bg-red-500" : "bg-green-500"} rounded-full`}
                          >
                            {role}
                          </span>
                        ))
                      ) : (
                        <Typography variant="body2" className="text-red-500">-</Typography>
                      )}
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      POR DEFINIR
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      <span className={`text-sm ${usuario.is_active ? "text-green-500" : "text-red-500"}`}>
                        {usuario.is_active ? "Habilitado" : "Deshabilitado"}
                      </span>
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      <IconButton className="text-inherit dark:text-white">
                        <Visibility />
                      </IconButton>
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      <IconButton className="text-inherit dark:text-white">
                        <Edit />
                      </IconButton>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={usuarios.length}
          rowsPerPage={filasPorPagina}
          page={pagina}
          onPageChange={handleCambiarPagina}
          onRowsPerPageChange={handleCambiarFilasPorPagina}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`}
          sx={{ color: (theme) => theme.palette.mode === 'dark' ? '#ffffff' : 'inherit' }}
        />
      </div>
      <button
        onClick={handleCrearUsuario}
        className={`mt-4 w-full border border-gray-300 px-5 py-3 text-white transition bg-blue-900 hover:bg-blue-700 focus:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 dark:bg-blue-500 dark:hover:bg-blue-400`}
      >
        Crear Usuario
      </button>
    </div>
  );
};

export default Usuarios;
