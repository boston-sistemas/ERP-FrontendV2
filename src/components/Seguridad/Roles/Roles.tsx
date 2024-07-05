// src/components/Seguridad/Roles/Roles.tsx
"use client";

import React, { useState, useEffect } from "react";
import instance from "@/config/AxiosConfig";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { TablePagination, IconButton, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, ListItemIcon, TextField } from "@mui/material";
import { Edit, Visibility, Assignment, Shield, Build } from "@mui/icons-material";
import "@/css/checkbox.css";

const TIMEOUT = 1000;

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

const Roles: React.FC = () => {
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openViewPermissionsDialog, setOpenViewPermissionsDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Rol | null>(null);
  const router = useRouter();

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await instance.get('/security/v1/roles/');
      setRoles(response.data.roles);
    } catch (error) {
      console.error('Error fetching roles', error);
      setError('Error fetching roles');
    } finally {
      setTimeout(() => setLoading(false), TIMEOUT);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleCambiarPagina = (event: any, newPage: any) => {
    setPagina(newPage);
  };

  const handleCambiarFilasPorPagina = (event: any) => {
    setFilasPorPagina(parseInt(event.target.value, 10));
    setPagina(0);
  };

  const handleCrearRol = () => {
    router.push('/seguridad/roles/crear-rol');
  };

  const handleEditRole = (rol: Rol) => {
    setSelectedRole(rol);
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
  };

  const handleViewPermissions = (rol: Rol) => {
    setSelectedRole(rol);
    setOpenViewPermissionsDialog(true);
  };

  const handleCloseViewPermissionsDialog = () => {
    setOpenViewPermissionsDialog(false);
  };

  const handleSaveRole = async () => {
    if (selectedRole) {
      try {
        const updatedRole: Partial<Rol> = {
          nombre: selectedRole.nombre,
          is_active: selectedRole.is_active,
        };

        await instance.put(`/security/v1/roles/${selectedRole.rol_id}`, updatedRole);
        fetchRoles();
        handleCloseEditDialog();
      } catch (error) {
        console.error('Error updating role', error);
      }
    }
  };

  return (
    <div className="space-y-5">
      {error && (
        <div className="text-red-500">{error}</div>
      )}
      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
          Roles 
        </h4>
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-blue-900 uppercase text-center dark:bg-meta-4">
                {["Nombre", "Estado", "Accesos", "Editar"].map((column, index) => (
                  <th key={index} className="px-4 py-4 text-center font-normal text-white dark:text-zinc-100">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="pt-5 pb-5 text-center text-black dark:text-white">
                    Cargando...
                  </td>
                </tr>
              ) : roles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="pt-5 pb-5 text-center text-black dark:text-white">
                    No existen roles
                  </td>
                </tr>
              ) : (
                roles.slice(pagina * filasPorPagina, pagina * filasPorPagina + filasPorPagina).map(rol => (
                  <tr key={rol.rol_id} className="text-center">
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      <Typography variant="body1" className="text-black dark:text-white">{rol.nombre}</Typography>
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      <span className={`text-sm ${rol.is_active ? "text-green-500" : "text-red-500"}`}>
                        {rol.is_active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      <IconButton className="text-inherit dark:text-white" onClick={() => handleViewPermissions(rol)}>
                        <Visibility />
                      </IconButton>
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      <IconButton className="text-inherit dark:text-white" onClick={() => handleEditRole(rol)}>
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
          count={roles.length}
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
        onClick={handleCrearRol}
        className={`mt-4 w-full border border-gray-300 px-5 py-3 text-white transition bg-blue-900 hover:bg-blue-700 focus:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 dark:bg-blue-500 dark:hover:bg-blue-400`}
      >
        Crear Rol
      </button>

      <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
        <DialogTitle>Editar Rol</DialogTitle>
        <DialogContent>
          {selectedRole && (
            <>
              <TextField
                margin="dense"
                label="Nombre"
                fullWidth
                variant="outlined"
                value={selectedRole.nombre}
                onChange={(e) => setSelectedRole({ ...selectedRole, nombre: e.target.value })}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleSaveRole} color="primary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openViewPermissionsDialog} onClose={handleCloseViewPermissionsDialog}>
        <DialogContent>
          {selectedRole && (
            <List>
              {selectedRole.accesos.map(acceso => (
                <ListItem key={acceso.acceso_id}>
                  <ListItemIcon>
                    {acceso.nombre.includes("admin") ? <Shield /> : acceso.nombre.includes("key") ? <Build /> : <Assignment />}
                  </ListItemIcon>
                  <ListItemText primary={acceso.nombre} />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewPermissionsDialog} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Roles;
