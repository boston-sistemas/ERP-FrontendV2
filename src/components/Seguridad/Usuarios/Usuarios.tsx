"use client";

import React, { useState, useEffect } from "react";
import instance from "@/config/AxiosConfig";
import Image from "next/image";
import {
  TablePagination,
  IconButton,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { Edit, Add, Delete } from "@mui/icons-material";
import "@/css/checkbox.css";

const TIMEOUT = 1000;

interface Rol {
  rol_id: number;
  nombre: string;
  is_active: boolean;
  rol_color: string;
}

interface Usuario {
  usuario_id: number;
  username: string;
  email: string;
  display_name: string;
  is_active: boolean;
  blocked_until: string | null;
  roles: Rol[];
}

const Usuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [originalUser, setOriginalUser] = useState<Usuario | null>(null);
  const [openAddRoleDialog, setOpenAddRoleDialog] = useState(false);
  const [openRemoveRoleDialog, setOpenRemoveRoleDialog] = useState(false);
  const [allRoles, setAllRoles] = useState<Rol[]>([]);
  const [rolesToAdd, setRolesToAdd] = useState<number[]>([]);
  const [rolesToRemove, setRolesToRemove] = useState<number[]>([]);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const response = await instance.get('/security/v1/usuarios/');
      setUsuarios(response.data.usuarios);
    } catch (error) {
      console.error('Error fetching users', error);
      setError('Error fetching users');
    } finally {
      setTimeout(() => setLoading(false), TIMEOUT);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await instance.get('/security/v1/roles/');
      setAllRoles(response.data.roles);
    } catch (error) {
      console.error('Error fetching roles', error);
    }
  };

  useEffect(() => {
    fetchUsuarios();
    fetchRoles();
  }, []);

  const handleCambiarPagina = (event: any, newPage: any) => {
    setPagina(newPage);
  };

  const handleCambiarFilasPorPagina = (event: any) => {
    setFilasPorPagina(parseInt(event.target.value, 10));
    setPagina(0);
  };

  const handleEditUser = (usuario: Usuario) => {
    setSelectedUser(null);
    setOriginalUser(null);
    setSelectedUser(usuario);
    setOriginalUser({ ...usuario });
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
  };

  const handleSaveUser = async () => {
    if (selectedUser) {
      try {
        const updatedUser: Partial<Usuario> = {};
        if (selectedUser.username !== originalUser?.username) updatedUser.username = selectedUser.username;
        if (selectedUser.email !== originalUser?.email) updatedUser.email = selectedUser.email;
        if (selectedUser.display_name !== originalUser?.display_name) updatedUser.display_name = selectedUser.display_name;

        if (Object.keys(updatedUser).length > 0) {
          await instance.put(`/security/v1/usuarios/${selectedUser.usuario_id}`, updatedUser);
        }
        fetchUsuarios();
        handleCloseEditDialog();
      } catch (error) {
        console.error('Error updating user', error);
      }
    }
  };

  const handleAddRoleClick = () => {
    setRolesToAdd([]);
    setOpenAddRoleDialog(true);
  };

  const handleRemoveRoleClick = () => {
    setRolesToRemove([]);
    setOpenRemoveRoleDialog(true);
  };

  const handleAddRolesToUser = async () => {
    if (selectedUser) {
      try {
        await instance.post(`/security/v1/usuarios/${selectedUser.usuario_id}/roles/`, {
          rol_ids: rolesToAdd,
        });
        const updatedRoles = [...selectedUser.roles, ...allRoles.filter(role => rolesToAdd.includes(role.rol_id))];
        setSelectedUser({ ...selectedUser, roles: updatedRoles });
        setOpenAddRoleDialog(false);
      } catch (error) {
        console.error('Error adding roles to user', error);
      }
    }
  };

  const handleRemoveRolesFromUser = async () => {
    if (selectedUser) {
      try {
        await instance.delete(`/security/v1/usuarios/${selectedUser.usuario_id}/roles/`, {
          data: { rol_ids: rolesToRemove },
        });
        const updatedRoles = selectedUser.roles.filter(role => !rolesToRemove.includes(role.rol_id));
        setSelectedUser({ ...selectedUser, roles: updatedRoles });
        setOpenRemoveRoleDialog(false);
      } catch (error) {
        console.error('Error removing roles from user', error);
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
          Lista de usuarios
        </h4>
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-blue-900 uppercase text-center dark:bg-meta-4">
                <th className="px-4 py-4"></th>
                {["Nombre", "Correo", "Roles", "Estado", "Editar"].map((column, index) => (
                  <th key={index} className="px-4 py-4 text-center font-normal text-white dark:text-zinc-100">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="pt-5 pb-5 text-center text-black dark:text-white">
                    Cargando...
                  </td>
                </tr>
              ) : usuarios.length === 0 ? (
                <tr>
                  <td colSpan={5} className="pt-5 pb-5 text-center text-black dark:text-white">
                    No existen usuarios
                  </td>
                </tr>
              ) : (
                usuarios.slice(pagina * filasPorPagina, pagina * filasPorPagina + filasPorPagina).map(usuario => (
                  <tr key={usuario.usuario_id} className="text-center">
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark flex items-center justify-center">
                      <Image src="/images/user/user-default.png" alt="User" width={40} height={40} className="rounded-full" />
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      <Typography variant="body1" className="text-black dark:text-white">{usuario.display_name}</Typography>
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      <Typography variant="body2" className="text-black dark:text-white">{usuario.email}</Typography>
                    </td>
                    <td className="max-w-50 border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      {usuario.roles.length > 0 ? (
                        usuario.roles.map((role, index) => (
                          <span
                            key={index}
                            style={{ backgroundColor: role.rol_color }}
                            className="inline-block ml-1 mr-1 px-2 py-1 text-xs font-medium text-white rounded-full"
                          >
                            {role.nombre}
                          </span>
                        ))
                      ) : (
                        <Typography variant="body2">Sin roles</Typography>
                      )}
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      <span className={`text-sm ${usuario.is_active ? "text-green-500" : "text-red-500"}`}>
                        {usuario.is_active ? "Habilitado" : "Deshabilitado"}
                      </span>
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      <IconButton className="text-inherit dark:text-white" onClick={() => handleEditUser(usuario)}>
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

      <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
        <DialogTitle>Editar Usuario</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <>
              <TextField
                margin="dense"
                label="Nombre"
                fullWidth
                variant="outlined"
                value={selectedUser.username}
                onChange={(e) => setSelectedUser({ ...selectedUser, username: e.target.value })}
              />
              <TextField
                margin="dense"
                label="Display Name"
                fullWidth
                variant="outlined"
                value={selectedUser.display_name}
                onChange={(e) => setSelectedUser({ ...selectedUser, display_name: e.target.value })}
              />
              <TextField
                margin="dense"
                label="Email"
                fullWidth
                variant="outlined"
                value={selectedUser.email}
                onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
              />
            </>
          )}
        </DialogContent>
        <DialogTitle>Roles</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
                {selectedUser.roles.map((role, index) => (
                  <span
                    key={index}
                    style={{
                      backgroundColor: role.rol_color,
                      color: '#fff',
                      borderRadius: '12px',
                      padding: '4px 12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      display: 'inline-block',
                    }}
                  >
                    {role.nombre}
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                <IconButton onClick={handleAddRoleClick}>
                  <Add />
                </IconButton>
                <IconButton onClick={handleRemoveRoleClick}>
                  <Delete />
                </IconButton>
              </div>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleSaveUser} color="primary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openAddRoleDialog} onClose={() => setOpenAddRoleDialog(false)}>
        <DialogTitle>Añadir Roles</DialogTitle>
        <DialogContent>
          {allRoles.filter(role => !selectedUser?.roles.some(userRole => userRole.nombre === role.nombre)).map((role, index) => (
            <FormControlLabel
              key={index}
              control={
                <Checkbox
                  checked={rolesToAdd.includes(role.rol_id)}
                  onChange={(e) => {
                    const newRolesToAdd = e.target.checked
                      ? [...rolesToAdd, role.rol_id]
                      : rolesToAdd.filter(id => id !== role.rol_id);
                    setRolesToAdd(newRolesToAdd);
                  }}
                />
              }
              label={role.nombre}
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddRoleDialog(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleAddRolesToUser} color="primary">
            Añadir
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openRemoveRoleDialog} onClose={() => setOpenRemoveRoleDialog(false)}>
        <DialogTitle>Eliminar Roles</DialogTitle>
        <DialogContent>
          {selectedUser?.roles.map((role, index) => (
            <FormControlLabel
              key={index}
              control={
                <Checkbox
                  checked={rolesToRemove.includes(role.rol_id)}
                  onChange={(e) => {
                    const newRolesToRemove = e.target.checked
                      ? [...rolesToRemove, role.rol_id]
                      : rolesToRemove.filter(id => id !== role.rol_id);
                    setRolesToRemove(newRolesToRemove);
                  }}
                />
              }
              label={role.nombre}
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRemoveRoleDialog(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleRemoveRolesFromUser} color="primary">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Usuarios;
