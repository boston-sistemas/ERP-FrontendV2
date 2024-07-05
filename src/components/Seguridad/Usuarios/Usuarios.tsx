"use client";

import React, { useState, useEffect } from "react";
import instance from "@/config/AxiosConfig";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  TablePagination,
  IconButton,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  TextField,
  Chip,
  InputAdornment,
} from "@mui/material";
import { Edit, Visibility, Assignment, Shield, Build, PowerSettingsNew, Add, Delete, Close, Search } from "@mui/icons-material";
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

interface Usuario {
  usuario_id: number;
  username: string;
  email: string;
  display_name: string;
  is_active: boolean;
  blocked_until: string;
  roles: Rol[];
}

const Usuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openViewPermissionsDialog, setOpenViewPermissionsDialog] = useState(false);
  const [openAddRoleDialog, setOpenAddRoleDialog] = useState(false);
  const [openRemoveRoleDialog, setOpenRemoveRoleDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [selectedRoleAccesses, setSelectedRoleAccesses] = useState<Rol[]>([]);
  const [originalUser, setOriginalUser] = useState<Usuario | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<Rol[]>([]);
  const [removeRoles, setRemoveRoles] = useState<Rol[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

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
      setRoles(response.data.roles);
    } catch (error) {
      console.error('Error fetching roles', error);
    }
  };

  const fetchRoleAccesses = async (role_id: number) => {
    try {
      const response = await instance.get(`/security/v1/roles/${role_id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching role accesses', error);
      return null;
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

  const handleCrearUsuario = () => {
    router.push('/seguridad/usuarios/crear-usuario');
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

  const handleDeleteUser = async () => {
    if (selectedUser) {
      try {
        await instance.delete(`/security/v1/usuarios/${selectedUser.usuario_id}`);
        fetchUsuarios();
        handleCloseEditDialog();
      } catch (error) {
        console.error('Error deleting user', error);
      }
    }
  };

  const handleViewPermissions = async (usuario: Usuario) => {
    setSelectedRoleAccesses([]);
    setSelectedUser(null);
    const roleAccessesPromises = usuario.roles.map(rol => fetchRoleAccesses(rol.rol_id));
    const roleAccesses = await Promise.all(roleAccessesPromises);
    setSelectedRoleAccesses(roleAccesses.filter(access => access !== null));
    setSelectedUser(usuario);
    setOpenViewPermissionsDialog(true);
  };

  const handleCloseViewPermissionsDialog = () => {
    setOpenViewPermissionsDialog(false);
  };

  const handleSaveUser = async () => {
    if (selectedUser) {
      try {
        const updatedUser: Partial<Usuario> = {};
        if (selectedUser.username !== originalUser?.username) updatedUser.username = selectedUser.username;
        if (selectedUser.email !== originalUser?.email) updatedUser.email = selectedUser.email;
        if (selectedUser.display_name !== originalUser?.display_name) updatedUser.display_name = selectedUser.display_name;
        if (selectedUser.is_active !== originalUser?.is_active) updatedUser.is_active = selectedUser.is_active;
        if (selectedUser.blocked_until !== originalUser?.blocked_until) updatedUser.blocked_until = selectedUser.blocked_until;

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

  const handleToggleUserStatus = async (usuario: Usuario) => {
    try {
      await instance.put(`/security/v1/usuarios/${usuario.usuario_id}`, {
        is_active: !usuario.is_active,
      });
      fetchUsuarios();
    } catch (error) {
      console.error('Error toggling user status', error);
    }
  };

  const handleOpenAddRoleDialog = (usuario: Usuario) => {
    setSelectedUser(usuario);
    setOpenAddRoleDialog(true);
  };

  const handleCloseAddRoleDialog = () => {
    setOpenAddRoleDialog(false);
    setSelectedRoles([]);
    setSearchTerm("");
  };

  const handleOpenRemoveRoleDialog = (usuario: Usuario) => {
    setSelectedUser(usuario);
    setOpenRemoveRoleDialog(true);
  };

  const handleCloseRemoveRoleDialog = () => {
    setOpenRemoveRoleDialog(false);
    setRemoveRoles([]);
  };

  const handleAddRole = async () => {
    if (selectedUser) {
      try {
        await instance.post(`/security/v1/usuarios/${selectedUser.usuario_id}/roles/`, {
          rol_ids: selectedRoles.map(rol => rol.rol_id)
        });
        fetchUsuarios();
        handleCloseAddRoleDialog();
      } catch (error) {
        console.error('Error adding role', error);
      }
    }
  };

  const handleRemoveRole = async () => {
    if (selectedUser) {
      try {
        await instance.delete(`/security/v1/usuarios/${selectedUser.usuario_id}/roles/`, {
          data: { rol_ids: removeRoles.map(rol => rol.rol_id) }
        });
        fetchUsuarios();
        handleCloseRemoveRoleDialog();
      } catch (error) {
        console.error('Error removing role', error);
      }
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredRoles = roles.filter(rol =>
    rol.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleRole = (rol: Rol) => {
    setSelectedRoles(prev => {
      if (prev.some(selected => selected.rol_id === rol.rol_id)) {
        return prev.filter(selected => selected.rol_id !== rol.rol_id);
      } else {
        return [...prev, rol];
      }
    });
  };

  const handleToggleRemoveRole = (rol: Rol) => {
    setRemoveRoles(prev => {
      if (prev.some(selected => selected.rol_id === rol.rol_id)) {
        return prev.filter(selected => selected.rol_id !== rol.rol_id);
      } else {
        return [...prev, rol];
      }
    });
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
                {["Nombre", "Correo", "Roles", "Permisos", "Estado", " ", "Editar"].map((column, index) => (
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
                            className={`inline-block ml-1 mr-1 px-2 py-1 text-xs font-medium text-white ${role.nombre === "MECSA_OPERACIONES" ? "bg-blue-500" : role.nombre === "PROVEEDOR" ? "bg-teal-500" : "bg-green-500"} rounded-full`}
                          >
                            {role.nombre}
                          </span>
                        ))
                      ) : (
                        <Typography variant="body2">Sin roles</Typography>
                      )}
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      <IconButton className="text-inherit dark:text-white" onClick={() => handleViewPermissions(usuario)}>
                        <Visibility />
                      </IconButton>
                      <IconButton className="text-inherit dark:text-white" onClick={() => handleOpenAddRoleDialog(usuario)}>
                        <Add />
                      </IconButton>
                      <IconButton className="text-inherit dark:text-white" onClick={() => handleOpenRemoveRoleDialog(usuario)}>
                        <Delete />
                      </IconButton>
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      <span className={`text-sm ${usuario.is_active ? "text-green-500" : "text-red-500"}`}>
                        {usuario.is_active ? "Habilitado" : "Deshabilitado"}
                      </span>
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      <IconButton onClick={() => handleToggleUserStatus(usuario)} className="text-blue-500">
                        <PowerSettingsNew />
                      </IconButton>
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
      <button
        onClick={handleCrearUsuario}
        className={`mt-4 w-full border border-gray-300 px-5 py-3 text-white transition bg-blue-900 hover:bg-blue-700 focus:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 dark:bg-blue-500 dark:hover:bg-blue-400`}
      >
        Crear Usuario
      </button>

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
        <DialogActions>
        <Button onClick={handleDeleteUser} color="error">
            Eliminar
          </Button>
          <Button onClick={handleCloseEditDialog} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleSaveUser} color="primary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openViewPermissionsDialog} onClose={handleCloseViewPermissionsDialog}>
        <DialogTitle>Ver Permisos</DialogTitle>
        <DialogContent>
          {selectedRoleAccesses.length > 0 && (
            <List>
              {selectedRoleAccesses.map(role => (
                <div key={role.rol_id} className="mb-4">
                  <Typography variant="h6">{role.nombre}</Typography>
                  <List>
                    {role.accesos.map(acceso => (
                      <ListItem key={acceso.acceso_id}>
                        <ListItemIcon>
                          {acceso.nombre.includes("admin") ? <Shield /> : acceso.nombre.includes("key") ? <Build /> : <Assignment />}
                        </ListItemIcon>
                        <ListItemText primary={acceso.nombre} />
                      </ListItem>
                    ))}
                  </List>
                </div>
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

      <Dialog open={openAddRoleDialog} onClose={handleCloseAddRoleDialog}>
        <DialogTitle>Agregar Roles</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Buscar Rol"
            fullWidth
            variant="outlined"
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton>
                    <Search />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <div className="my-2">
            {selectedRoles.map(rol => (
              <Chip
                key={rol.rol_id}
                label={rol.nombre}
                onDelete={() => handleToggleRole(rol)}
                deleteIcon={<Close />}
                color="primary"
                variant="outlined"
                className="mr-1 mb-1"
              />
            ))}
          </div>
          <List>
            {filteredRoles.filter(rol => !selectedUser?.roles.some(userRole => userRole.rol_id === rol.rol_id)).map(rol => (
              <ListItem key={rol.rol_id} button onClick={() => handleToggleRole(rol)}>
                <ListItemIcon>
                  {rol.nombre.includes("admin") ? <Shield /> : rol.nombre.includes("key") ? <Build /> : <Assignment />}
                </ListItemIcon>
                <ListItemText primary={rol.nombre} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddRoleDialog} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleAddRole} color="primary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openRemoveRoleDialog} onClose={handleCloseRemoveRoleDialog}>
        <DialogTitle>Quitar Roles</DialogTitle>
        <DialogContent>
          <div className="my-2">
            {removeRoles.map(rol => (
              <Chip
                key={rol.rol_id}
                label={rol.nombre}
                onDelete={() => handleToggleRemoveRole(rol)}
                deleteIcon={<Close className="text-red-500" />}
                className="mr-1 mb-1 border-red-500 text-red-500"
                variant="outlined"
              />
            ))}
          </div>
          <List>
            {selectedUser?.roles.map(rol => (
              <ListItem key={rol.rol_id} button onClick={() => handleToggleRemoveRole(rol)}>
                <ListItemIcon>
                  {rol.nombre.includes("admin") ? <Shield /> : rol.nombre.includes("key") ? <Build /> : <Assignment />}
                </ListItemIcon>
                <ListItemText primary={rol.nombre} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRemoveRoleDialog} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleRemoveRole} color="primary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Usuarios;
