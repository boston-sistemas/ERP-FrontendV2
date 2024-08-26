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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  TextField,
  FormControlLabel,
  Checkbox,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Edit,
  Visibility,
  Assignment,
  Shield,
  Build,
  Add,
  Delete,
  PowerSettingsNew,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { Rol, Acceso } from "@/app/(modulos)/seguridad/roles/models/rolModel";
import {
  obtenerRoles,
  obtenerAccesos,
  actualizarRol,
  eliminarRol,
  agregarAccesoARol,
  eliminarAccesoDeRol,
  cambiarEstadoRol,
} from "@/app/(modulos)/seguridad/roles/use-cases/roles";

const TIMEOUT = 1000;

const Roles: React.FC = () => {
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openViewPermissionsDialog, setOpenViewPermissionsDialog] = useState(false);
  const [openAddAccessDialog, setOpenAddAccessDialog] = useState(false);
  const [openRemoveAccessDialog, setOpenRemoveAccessDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Rol | null>(null);
  const [accesos, setAccesos] = useState<Acceso[]>([]);
  const [selectedAccesos, setSelectedAccesos] = useState<Acceso[]>([]);
  const [removeAccesos, setRemoveAccesos] = useState<Acceso[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");
  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);
  const router = useRouter();

  useEffect(() => {
    obtenerRoles(setRoles, setLoading, setError);
    obtenerAccesos(setAccesos, setError);
  }, []);

  const handleCambiarPagina = (event: any, newPage: any) => {
    setPagina(newPage);
  };

  const handleCambiarFilasPorPagina = (event: any) => {
    setFilasPorPagina(parseInt(event.target.value, 10));
    setPagina(0);
  };

  const handleCrearRol = () => {
    router.push("/seguridad/roles/crear-rol");
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

  const handleOpenAddAccessDialog = (rol: Rol) => {
    setSelectedRole(rol);
    setOpenAddAccessDialog(true);
  };

  const handleCloseAddAccessDialog = () => {
    setOpenAddAccessDialog(false);
    setSelectedAccesos([]);
  };

  const handleOpenRemoveAccessDialog = (rol: Rol) => {
    setSelectedRole(rol);
    setOpenRemoveAccessDialog(true);
  };

  const handleCloseRemoveAccessDialog = () => {
    setOpenRemoveAccessDialog(false);
    setRemoveAccesos([]);
  };

  const handleSaveRole = async () => {
    if (selectedRole) {
      await actualizarRol(selectedRole, setRoles, () => obtenerRoles(setRoles, setLoading, setError), handleCloseEditDialog);
    }
  };

  const handleDeleteRole = async () => {
    if (selectedRole) {
      await eliminarRol(selectedRole.rol_id, () => obtenerRoles(setRoles, setLoading, setError));
      setOpenDeleteConfirmation(false);
    }
  };

  const handleOpenDeleteConfirmation = () => {
    setOpenDeleteConfirmation(true);
  };

  const handleCloseDeleteConfirmation = () => {
    setOpenDeleteConfirmation(false);
  };

  const handleToggleRoleStatus = async (rol: Rol) => {
    await cambiarEstadoRol(rol, () => obtenerRoles(setRoles, setLoading, setError));
  };

  const handleAddAccess = async () => {
    if (selectedRole) {
      await agregarAccesoARol(selectedRole, selectedAccesos.map(acceso => acceso.acceso_id), setSelectedRole, () => obtenerRoles(setRoles, setLoading, setError), handleCloseAddAccessDialog);
    }
  };

  const handleRemoveAccess = async () => {
    if (selectedRole) {
      await eliminarAccesoDeRol(selectedRole, removeAccesos.map(acceso => acceso.acceso_id), setSelectedRole, () => obtenerRoles(setRoles, setLoading, setError), handleCloseRemoveAccessDialog);
    }
  };

  const handleToggleAcceso = (acceso: Acceso) => {
    setSelectedAccesos((prev) => {
      if (prev.some((selected) => selected.acceso_id === acceso.acceso_id)) {
        return prev.filter((selected) => selected.acceso_id !== acceso.acceso_id);
      } else {
        return [...prev, acceso];
      }
    });
  };

  const handleToggleRemoveAcceso = (acceso: Acceso) => {
    setRemoveAccesos((prev) => {
      if (prev.some((selected) => selected.acceso_id === acceso.acceso_id)) {
        return prev.filter((selected) => selected.acceso_id !== acceso.acceso_id);
      } else {
        return [...prev, acceso];
      }
    });
  };

  return (
    <div className="space-y-5">
      {error && <div className="text-red-500">{error}</div>}
      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">Lista de roles</h4>
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-blue-900 uppercase text-center dark:bg-meta-4">
                {["Nombre", "Accesos", "Cantidad", "Estado", " ", "Editar"].map((column, index) => (
                  <th key={index} className="px-4 py-4 text-center font-normal text-white dark:text-zinc-100">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="pt-5 pb-5 text-center text-black dark:text-white">Cargando...</td>
                </tr>
              ) : roles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="pt-5 pb-5 text-center text-black dark:text-white">No existen roles</td>
                </tr>
              ) : (
                roles.slice(pagina * filasPorPagina, pagina * filasPorPagina + filasPorPagina).map((rol) => (
                  <tr key={rol.rol_id} className="text-center">
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      <Typography variant="body1" className="text-black dark:text-white">{rol.nombre}</Typography>
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      <IconButton className="text-inherit dark:text-white" onClick={() => handleViewPermissions(rol)}>
                        <Visibility />
                      </IconButton>
                      <IconButton className="text-inherit dark:text-white" onClick={() => handleOpenAddAccessDialog(rol)}>
                        <Add />
                      </IconButton>
                      <IconButton className="text-inherit dark:text-white" onClick={() => handleOpenRemoveAccessDialog(rol)}>
                        <Delete />
                      </IconButton>
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      <Typography variant="body1" className="text-black dark:text-white">{rol.accesos.length}</Typography>
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      <span className={`text-sm ${rol.is_active ? "text-green-500" : "text-red-500"}`}>{rol.is_active ? "Habilitado" : "Deshabilitado"}</span>
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      <IconButton onClick={() => handleToggleRoleStatus(rol)} className="text-blue-500">
                        <PowerSettingsNew />
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
          sx={{ color: (theme) => theme.palette.mode === "dark" ? "#ffffff" : "inherit" }}
        />
      </div>
      <button onClick={handleCrearRol} className={`mt-4 w-full border border-gray-300 px-5 py-3 text-white transition bg-blue-900 hover:bg-blue-700 focus:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 dark:bg-blue-500 dark:hover:bg-blue-400`}>Crear Rol</button>

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
              <TextField
                margin="dense"
                label="Color del Rol"
                fullWidth
                variant="outlined"
                value={selectedRole.rol_color}
                onChange={(e) => setSelectedRole({ ...selectedRole, rol_color: e.target.value })}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleOpenDeleteConfirmation} color="error">Eliminar</Button>
          <Button onClick={handleCloseEditDialog} color="primary">Cancelar</Button>
          <Button onClick={handleSaveRole} color="primary">Guardar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDeleteConfirmation} onClose={handleCloseDeleteConfirmation}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>¿Estás seguro de que quieres eliminar este rol?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirmation} color="primary">Cancelar</Button>
          <Button onClick={handleDeleteRole} color="error">Eliminar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openViewPermissionsDialog} onClose={handleCloseViewPermissionsDialog}>
        <DialogTitle>Accesos del Rol</DialogTitle>
        <DialogContent>
          {selectedRole && selectedRole.accesos.length > 0 ? (
            <List>
              {selectedRole.accesos.map((acceso) => (
                <ListItem key={acceso.acceso_id}>
                  <ListItemIcon>
                    {acceso.nombre.includes("admin") ? <Shield /> : acceso.nombre.includes("key") ? <Build /> : <Assignment />}
                  </ListItemIcon>
                  <ListItemText primary={acceso.nombre} secondary={acceso.is_active ? "Habilitado" : "Deshabilitado"} />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography>No hay accesos para mostrar.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewPermissionsDialog} color="primary">Cerrar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openAddAccessDialog} onClose={handleCloseAddAccessDialog}>
        <DialogTitle>Añadir Accesos</DialogTitle>
        <DialogContent>
          {accesos.filter(access => !selectedRole?.accesos.some(roleAccess => roleAccess.nombre === access.nombre)).map((access, index) => (
            <FormControlLabel
              key={index}
              control={
                <Checkbox
                  checked={selectedAccesos.some((selected) => selected.acceso_id === access.acceso_id)}
                  onChange={() => handleToggleAcceso(access)}
                />
              }
              label={access.nombre}
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddAccessDialog(false)} color="primary">Cancelar</Button>
          <Button onClick={handleAddAccess} color="primary">Añadir</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openRemoveAccessDialog} onClose={handleCloseRemoveAccessDialog}>
        <DialogTitle>Eliminar Accesos</DialogTitle>
        <DialogContent>
          {selectedRole?.accesos.map((access, index) => (
            <FormControlLabel
              key={index}
              control={
                <Checkbox
                  checked={removeAccesos.some((selected) => selected.acceso_id === access.acceso_id)}
                  onChange={() => handleToggleRemoveAcceso(access)}
                />
              }
              label={access.nombre}
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRemoveAccessDialog(false)} color="primary">Cancelar</Button>
          <Button onClick={handleRemoveAccess} color="primary">Eliminar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: "100%", alignItems: "center" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Roles;
