"use client";

import React, { useState, useEffect } from "react";
import {
  TablePagination,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import instance from "@/infrastructure/config/AxiosConfig";

const columns = [
  "OS",
  "Tejido",
  "Ancho",
  "Tejeduria",
  "Fecha Movimiento",
  "Rollos",
  "Peso",
  "Acciones",
];

const minWidths = [
  "min-w-[110px]",  // OS
  "min-w-[110px]",  // Tejido
  "min-w-[120px]",  // Ancho
  "min-w-[110px]",  // Tejeduria
  "min-w-[110px]",  // Fecha Movimiento
  "min-w-[50px]",  // Rollos
  "min-w-[50px]",  // Peso
  "min-w-[110px]",  // Acciones
];

const movimientosData = [
    { id: 1, os: "TIR1492", tejido: "RBV165", ancho: 39, tejeduria: "Tejeduria1", fecha_movimiento: "2024-01-08", rollos: 39, peso: 39 },
    { id: 2, os: "TIR1492", tejido: "RBV165", ancho: 36, tejeduria: "Tejeduria2", fecha_movimiento: "2024-01-08", rollos: 39, peso: 39 },
    { id: 3, os: "FRA1493", tejido: "RLK240", ancho: 80, tejeduria: "Tejeduria3", fecha_movimiento: "2024-01-08", rollos: 39, peso: 39 },
    { id: 4, os: "FRA1493", tejido: "RBV165", ancho: 41, tejeduria: "Tejeduria2", fecha_movimiento: "2024-01-11", rollos: 39, peso: 39 }
  ];

const TablaMovimientos: React.FC = () => {
  const [movimientos, setMovimientos] = useState<any[]>(movimientosData);
  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [loading, setLoading] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [selectedMovimiento, setSelectedMovimiento] = useState<any | null>(null);
  const [newMovimiento, setNewMovimiento] = useState<any>({
    os: '',
    tejido: '',
    ancho: '',
    tejeduria: '',
    fecha_movimiento: '',
    rollos: '',
    peso: ''
  });

  const [tejeduriaFilter, setTejeduriaFilter] = useState("");
  const [osFilter, setOsFilter] = useState("");

  const fetchMovimientos = async () => {
    try {
      setLoading(true);
      const response = await instance.get("/path-to-api-endpoint");
      setMovimientos(response.data.movimientos);
    } catch (error) {
      console.error("Error fetching movimientos", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovimientos();
  }, []);

  const handleCambiarPagina = (event: any, newPage: any) => {
    setPagina(newPage);
  };

  const handleCambiarFilasPorPagina = (event: any) => {
    setFilasPorPagina(parseInt(event.target.value, 10));
    setPagina(0);
  };

  const handleEditMovimiento = (movimiento: any) => {
    setSelectedMovimiento({ ...movimiento });
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
  };

  const handleSaveMovimiento = async () => {
    if (selectedMovimiento) {
      try {
        await instance.put(`/path-to-api-endpoint/${selectedMovimiento.id}`, selectedMovimiento);
        const updatedMovimientos = movimientos.map(mov => 
          mov.id === selectedMovimiento.id ? selectedMovimiento : mov
        );
        setMovimientos(updatedMovimientos);
        handleCloseEditDialog();
      } catch (error) {
        console.error("Error updating movimiento", error);
      }
    }
  };

  const handleOpenAddDialog = () => {
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
  };

  const handleAddMovimiento = async () => {
    try {
      const response = await instance.post('/path-to-api-endpoint', newMovimiento);
      setMovimientos([response.data.movimiento, ...movimientos]);
      handleCloseAddDialog();
    } catch (error) {
      console.error("Error adding movimiento", error);
    }
  };

  const handleDeleteMovimiento = async (id: number) => {
    try {
      await instance.delete(`/path-to-api-endpoint/${id}`);
      const updatedMovimientos = movimientos.filter(mov => mov.id !== id);
      setMovimientos(updatedMovimientos);
    } catch (error) {
      console.error("Error deleting movimiento", error);
    }
  };

  const filteredMovimientos = movimientos.filter(movimiento => {
    const matchesTejeduria = tejeduriaFilter === "" || movimiento.tejeduria === tejeduriaFilter;
    const matchesOs = osFilter === "" || movimiento.os.includes(osFilter);

    return matchesTejeduria && matchesOs;
  });

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <FormControl fullWidth variant="outlined" size="small">
          <InputLabel className="dark:text-zinc-100">Tejeduria</InputLabel>
          <Select
            value={tejeduriaFilter}
            onChange={(e) => setTejeduriaFilter(e.target.value)}
            label="Tejeduria"
            className="dark:text-zinc-100"
            MenuProps={{
              PaperProps: {
                className: "dark:bg-boxdark",
              },
            }}
          >
            <MenuItem className="dark:text-zinc-100" value="">---</MenuItem>
            <MenuItem className="dark:text-zinc-100" value="Tejeduria1">Tejeduria1</MenuItem>
            <MenuItem className="dark:text-zinc-100" value="Tejeduria2">Tejeduria2</MenuItem>
            <MenuItem className="dark:text-zinc-100" value="Tejeduria3">Tejeduria3</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="OS"
          value={osFilter}
          onChange={(e) => setOsFilter(e.target.value)}
          fullWidth
          variant="outlined"
          size="small"
          className="dark:text-zinc-100"
          InputLabelProps={{
            className: "dark:text-zinc-100",
          }}
          InputProps={{
            className: "dark:text-zinc-100",
          }}
        />
      </div>
      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
          Registro de movimientos
        </h4>
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-blue-900 uppercase text-center dark:bg-meta-4">
                {columns.map((column, index) => (
                  <th key={index} className={`px-4 py-4 text-center font-normal text-white dark:text-zinc-100 ${minWidths[index]}`}>
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="pt-5 pb-5 text-center text-black dark:text-white">
                    Cargando...
                  </td>
                </tr>
              ) : filteredMovimientos.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="pt-5 pb-5 text-center text-black dark:text-white">
                    No existen movimientos
                  </td>
                </tr>
              ) : (
                filteredMovimientos.slice(pagina * filasPorPagina, pagina * filasPorPagina + filasPorPagina).map((movimiento, index) => (
                  <tr key={index} className="text-center">
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">{movimiento.os}</td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">{movimiento.tejido}</td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">{movimiento.ancho}</td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">{movimiento.tejeduria}</td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">{movimiento.fecha_movimiento}</td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">{movimiento.rollos}</td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">{movimiento.peso}</td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      <IconButton className="text-inherit dark:text-white" onClick={() => handleEditMovimiento(movimiento)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton className="text-inherit dark:text-white" onClick={() => handleDeleteMovimiento(movimiento.id)}>
                        <DeleteIcon />
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
          count={filteredMovimientos.length}
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
        onClick={handleOpenAddDialog}
        className="mt-4 w-full border border-gray-300 px-5 py-3 text-white transition bg-blue-800 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 dark:bg-blue-500 dark:hover:bg-blue-400"
      >
        Agregar movimiento
      </button>
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
        <DialogTitle>Editar Movimiento</DialogTitle>
        <DialogContent>
          {selectedMovimiento && (
            <>
              <TextField
                margin="dense"
                label="OS"
                fullWidth
                variant="outlined"
                value={selectedMovimiento.os}
                onChange={(e) => setSelectedMovimiento({ ...selectedMovimiento, os: e.target.value })}
              />  
              <TextField
                margin="dense"
                label="Tejido"
                fullWidth
                variant="outlined"
                value={selectedMovimiento.tejido}
                onChange={(e) => setSelectedMovimiento({ ...selectedMovimiento, tejido: e.target.value })}
              />
              <TextField
                margin="dense"
                label="Ancho"
                fullWidth
                variant="outlined"
                value={selectedMovimiento.ancho}
                onChange={(e) => setSelectedMovimiento({ ...selectedMovimiento, ancho: e.target.value })}
              />
              <TextField
                margin="dense"
                label="Tejeduria"
                fullWidth
                variant="outlined"
                value={selectedMovimiento.tejeduria}
                onChange={(e) => setSelectedMovimiento({ ...selectedMovimiento, tejeduria: e.target.value })}
              />
              <TextField
                margin="dense"
                label="Fecha Movimiento"
                fullWidth
                variant="outlined"
                value={selectedMovimiento.fecha_movimiento}
                InputProps={{
                  readOnly: true,
                }}
              />
              <TextField
                margin="dense"
                label="Rollos"
                fullWidth
                variant="outlined"
                value={selectedMovimiento.rollos}
                onChange={(e) => setSelectedMovimiento({ ...selectedMovimiento, rollos: e.target.value })}
              />
              <TextField
                margin="dense"
                label="Peso"
                fullWidth
                variant="outlined"
                value={selectedMovimiento.peso}
                onChange={(e) => setSelectedMovimiento({ ...selectedMovimiento, peso: e.target.value })}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleSaveMovimiento} color="primary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog}>
        <DialogTitle>Agregar Movimiento</DialogTitle>
        <DialogContent>
          <>
            <TextField
              margin="dense"
              label="OS"
              fullWidth
              variant="outlined"
              value={newMovimiento.os}
              onChange={(e) => setNewMovimiento({ ...newMovimiento, os: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Tejido"
              fullWidth
              variant="outlined"
              value={newMovimiento.tejido}
              onChange={(e) => setNewMovimiento({ ...newMovimiento, tejido: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Ancho"
              fullWidth
              variant="outlined"
              value={newMovimiento.ancho}
              onChange={(e) => setNewMovimiento({ ...newMovimiento, ancho: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Tejeduria"
              fullWidth
              variant="outlined"
              value={newMovimiento.tejeduria}
              onChange={(e) => setNewMovimiento({ ...newMovimiento, tejeduria: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Fecha Movimiento"
              fullWidth
              variant="outlined"
              value={newMovimiento.fecha_movimiento}
              onChange={(e) => setNewMovimiento({ ...newMovimiento, fecha_movimiento: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Rollos"
              fullWidth
              variant="outlined"
              value={newMovimiento.rollos}
              onChange={(e) => setNewMovimiento({ ...newMovimiento, rollos: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Peso"
              fullWidth
              variant="outlined"
              value={newMovimiento.peso}
              onChange={(e) => setNewMovimiento({ ...newMovimiento, peso: e.target.value })}
            />
          </>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleAddMovimiento} color="primary">
            Agregar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TablaMovimientos;
