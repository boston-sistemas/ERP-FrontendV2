// components/Usuarios.tsx

"use client";

import React, { useState, useEffect } from "react";
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
  Snackbar,
  Alert,
} from "@mui/material";
import Image from "next/image";
import { Edit, Add, Delete, PowerSettingsNew } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { Usuario, Rol } from "../../../models/models";
import { 
  handleFetchUsuarios, 
  handleFetchRoles, 
  handleUpdateUser, 
  handleToggleUserStatus, 
  handleResetPassword, 
  handleAddRolesToUser, 
  handleRemoveRolesFromUser 
} from "@/app/(modulos)/seguridad/usuarios/use-cases/usuario";

const TIMEOUT = 1000;

const Usuarios: React.FC = () => {
  const router = useRouter();
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
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  useEffect(() => {
    handleFetchUsuarios(setUsuarios, setLoading, setError);
    handleFetchRoles(setAllRoles, setError);
  }, []);

  const handleCambiarPagina = (event: any, newPage: any) => {
    setPagina(newPage);
  };

  const handleCambiarFilasPorPagina = (event: any) => {
    setFilasPorPagina(parseInt(event.target.value, 10));
    setPagina(0);
  };

  const handleEditUser = (usuario: Usuario) => {
    setSelectedUser(usuario);
    setOriginalUser({ ...usuario });
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
  };

  const handleSaveUser = async () => {
    if (selectedUser && originalUser) {
      await handleUpdateUser(selectedUser, originalUser, setUsuarios, () => handleFetchUsuarios(setUsuarios, setLoading, setError), handleCloseEditDialog);
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

  const handleAddRolesToUserWrapper = async () => {
    if (selectedUser) {
      await handleAddRolesToUser(selectedUser, rolesToAdd, setSelectedUser, setOpenAddRoleDialog, allRoles);
    }
  };

  const handleRemoveRolesFromUserWrapper = async () => {
    if (selectedUser) {
      await handleRemoveRolesFromUser(selectedUser, rolesToRemove, setSelectedUser, setOpenRemoveRoleDialog);
    }
  };

  const handleToggleUserStatusWrapper = async (usuario: Usuario) => {
    await handleToggleUserStatus(usuario, () => handleFetchUsuarios(setUsuarios, setLoading, setError));
  };

  const handleResetPasswordWrapper = async () => {
    if (selectedUser) {
      await handleResetPassword(selectedUser.usuario_id, setSnackbarSeverity, setSnackbarMessage, setSnackbarOpen);
    }
  };

  const handleCrearUsuario = () => {
    router.push('/seguridad/usuarios/crear-usuario');
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
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
                {["Nombre", "Correo", "Roles", "Estado", "Deshabilitar", "Editar"].map((column, index) => (
                  <th key={index} className="px-4 py-4 text-center font-normal text-white dark:text-zinc-100">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="pt-5 pb-5 text-center text-black dark:text-white">
                    Cargando...
                  </td>
                </tr>
              ) : usuarios.length === 0 ? (
                <tr>
                  <td colSpan={7} className="pt-5 pb-5 text-center text-black dark:text-white">
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
                      <IconButton onClick={() => handleToggleUserStatusWrapper(usuario)} className="text-blue-500">
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
          <Button onClick={handleResetPasswordWrapper} color="error">
            Resetear Contraseña
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
          <Button onClick={handleAddRolesToUserWrapper} color="primary">
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
          <Button onClick={handleRemoveRolesFromUserWrapper} color="primary">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%', alignItems: 'center' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Usuarios;

