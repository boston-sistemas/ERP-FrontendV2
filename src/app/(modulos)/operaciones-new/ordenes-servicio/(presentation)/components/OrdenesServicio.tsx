"use client";
import React, { useState, useEffect } from "react";
import {
  TablePagination,
  IconButton,
  Button,
  TextField,
  Menu,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { Search, Visibility, Add, Delete, Close } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import {
  fetchServiceOrders,
  fetchSuppliers,
  createServiceOrder,
} from "../../services/ordenesServicioService";

// (NUEVO) Importa el servicio que traiga tus tejidos
import { fetchTejidos } from "../../../tejidos/services/tejidosService"; // Ejemplo

import { ServiceOrder, Supplier } from "../../../models/models";

const OrdenesServicio: React.FC = () => {
  const router = useRouter();
  const [ordenesServicio, setOrdenesServicio] = useState<ServiceOrder[]>([]);
  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [includeInactive, setIncludeInactive] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  // Para crear la OS
  const [openDialog, setOpenDialog] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // (NUEVO) Tejidos
  const [fabrics, setFabrics] = useState<any[]>([]);
  const [isFabricDialogOpen, setIsFabricDialogOpen] = useState(false);

  // Estructura de la nueva OS
  const [newOrder, setNewOrder] = useState<{
    supplierId: string;
    detail: Array<{
      fabricId: string;
      quantityOrdered: number;
      price: number;
    }>;
  }>({
    supplierId: "",
    detail: [
      { fabricId: "", quantityOrdered: 0, price: 0 },
    ],
  });

  // Cargar OS
  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const resp = await fetchServiceOrders(filasPorPagina, pagina * filasPorPagina, includeInactive);
      setOrdenesServicio(resp.serviceOrders || []);
    } catch (e) {
      console.error("Error al cargar órdenes:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Al montar y cuando cambian paginación o includeInactive
  useEffect(() => {
    fetchOrders();
  }, [pagina, filasPorPagina, includeInactive]);

  // Cargar suppliers
  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        const resp = await fetchSuppliers();
        setSuppliers(resp);
      } catch (e) {
        console.error("Error al cargar proveedores:", e);
      }
    };
    loadSuppliers();
  }, []);

  // (NUEVO) Cargar tejidos
  const handleOpenFabricDialog = async (index: number) => {
    // Guardar el "index" donde pondremos el tejido
    setSelectedDetailIndex(index);
    try {
      const data = await fetchTejidos(); // GET /operations/v1/fabrics
      setFabrics(data.fabrics || []); // asume "data.fabrics"
      setIsFabricDialogOpen(true);
    } catch (e) {
      console.error("Error al cargar tejidos:", e);
    }
  };
  const handleCloseFabricDialog = () => {
    setIsFabricDialogOpen(false);
  };

  // (NUEVO) Al seleccionar un tejido de la tabla
  const [selectedDetailIndex, setSelectedDetailIndex] = useState<number>(0);
  const handleSelectFabric = (fabricId: string) => {
    // p.ej., actualizamos newOrder.detail[selectedDetailIndex].fabricId = fabricId
    const updated = [...newOrder.detail];
    updated[selectedDetailIndex].fabricId = fabricId;
    setNewOrder((prev) => ({ ...prev, detail: updated }));
    setIsFabricDialogOpen(false);
  };

  // Creación
  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  const handleAddDetailRow = () => {
    setNewOrder((prev) => ({
      ...prev,
      detail: [...prev.detail, { fabricId: "", quantityOrdered: 0, price: 0 }],
    }));
  };

  const handleDeleteDetailRow = (idx: number) => {
    setNewOrder((prev) => ({
      ...prev,
      detail: prev.detail.filter((_, i) => i !== idx),
    }));
  };

  const handleDetailChange = (idx: number, field: string, value: string | number) => {
    const updated = [...newOrder.detail];
    (updated[idx] as any)[field] = value;
    setNewOrder((prev) => ({ ...prev, detail: updated }));
  };

  const handleCreateOrder = async () => {
    try {
      const resp = await createServiceOrder(newOrder);
      // resp contendrá { id: "..." } u objeto con la OS
      setOpenDialog(false);

      // Redirigir a detalles
      router.push(`/operaciones-new/ordenes-servicio/detalles/${resp.id}`);
    } catch (err) {
      console.error("Error al crear la orden de servicio", err);
      alert("No se pudo crear la orden. Verifica los datos e intenta nuevamente.");
    }
  };

  // Helpers
  const getSupplierName = (supplierId: string) => {
    const sup = suppliers.find((s) => s.code === supplierId);
    return sup ? sup.name : supplierId;
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  const filteredOrders = ordenesServicio.filter((o) =>
    Object.values(o).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleDetailsClick = (orderId: string) => {
    router.push(`/operaciones-new/ordenes-servicio/detalles/${orderId}`);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default">
        {/* Encabezado */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-gray-300 rounded-md px-2">
              <Search />
              <TextField
                variant="standard"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{ disableUnderline: true }}
              />
            </div>
            <FormControlLabel
              control={
                <Switch
                  checked={includeInactive}
                  onChange={() => setIncludeInactive((prev) => !prev)}
                  color="primary"
                />
              }
              label="Incluir Inactivas"
            />
          </div>

          <Button
            startIcon={<Add />}
            variant="contained"
            style={{ backgroundColor: "#1976d2", color: "#fff" }}
            onClick={handleOpenDialog}
          >
            CREAR
          </Button>
        </div>

        {/* Tabla */}
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-blue-900 uppercase text-center text-white">
              <th className="px-4 py-4 font-normal">No. Servicio</th>
              <th className="px-4 py-4 font-normal">Proveedor</th>
              <th className="px-4 py-4 font-normal">Fecha Emisión</th>
              <th className="px-4 py-4 font-normal">Estado</th>
              <th className="px-4 py-4 font-normal">Detalles</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="text-center py-4">
                  Cargando...
                </td>
              </tr>
            ) : filteredOrders.length > 0 ? (
              filteredOrders.map((o) => (
                <tr key={o.id} className="text-center">
                  <td className="border-b border-[#eee] px-4 py-4">{o.id}</td>
                  <td className="border-b border-[#eee] px-4 py-4">
                    {getSupplierName(o.supplierId)}
                  </td>
                  <td className="border-b border-[#eee] px-4 py-4">{o.issueDate}</td>
                  <td className="border-b border-[#eee] px-4 py-4">{o.statusFlag}</td>
                  <td className="border-b border-[#eee] px-4 py-4">
                    <IconButton onClick={() => handleDetailsClick(o.id)}>
                      <Visibility />
                    </IconButton>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-4">
                  No se encontraron resultados.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Paginación */}
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={ordenesServicio.length}
          rowsPerPage={filasPorPagina}
          page={pagina}
          onPageChange={(_, newPage) => setPagina(newPage)}
          onRowsPerPageChange={(e) =>
            setFilasPorPagina(parseInt(e.target.value, 10))
          }
        />
      </div>

      {/* Diálogo Crear OS */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>Crear Nueva Orden de Servicio</DialogTitle>
        <DialogContent>
          <div className="space-y-4">
            <FormControl fullWidth>
              <InputLabel id="proveedor-label">Seleccione un proveedor</InputLabel>
              <Select
                labelId="proveedor-label"
                value={newOrder.supplierId}
                label="Seleccione un proveedor"
                onChange={(e) =>
                  setNewOrder({ ...newOrder, supplierId: e.target.value as string })
                }
              >
                <MenuItem value="" disabled>
                  -- Seleccione un proveedor --
                </MenuItem>
                {suppliers.map((sup) => (
                  <MenuItem key={sup.code} value={sup.code}>
                    {sup.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {newOrder.detail.map((detail, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <TextField
                  label="Tejido"
                  value={detail.fabricId}
                  onChange={(e) =>
                    handleDetailChange(index, "fabricId", e.target.value)
                  }
                  // Se oculta, y mejor se usa la selección via tabla:
                  style={{ display: "none" }}
                />
                <Button
                  variant="outlined"
                  onClick={() => handleOpenFabricDialog(index)}
                  startIcon={<Search />}
                >
                  {detail.fabricId ? `Tejido: ${detail.fabricId}` : "Seleccionar Tejido"}
                </Button>

                <TextField
                  label="Cantidad"
                  type="number"
                  value={detail.quantityOrdered}
                  onChange={(e) =>
                    handleDetailChange(index, "quantityOrdered", Number(e.target.value))
                  }
                  style={{ width: "100px" }}
                />
                <TextField
                  label="Precio"
                  type="number"
                  value={detail.price}
                  onChange={(e) =>
                    handleDetailChange(index, "price", Number(e.target.value))
                  }
                  style={{ width: "100px" }}
                />
                <IconButton onClick={() => handleDeleteDetailRow(index)} color="error">
                  <Delete />
                </IconButton>
              </div>
            ))}

            <Button
              onClick={handleAddDetailRow}
              variant="contained"
              style={{ backgroundColor: "#1976d2", color: "#fff" }}
            >
              Agregar Detalle
            </Button>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="error">
            Cancelar
          </Button>
          <Button
            onClick={handleCreateOrder}
            variant="contained"
            style={{ backgroundColor: "#1976d2", color: "#fff" }}
          >
            Crear
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para seleccionar tejido */}
      <Dialog
        open={isFabricDialogOpen}
        onClose={handleCloseFabricDialog}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>
          Seleccionar Tejido
          <IconButton
            aria-label="close"
            onClick={handleCloseFabricDialog}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Descripción</TableCell>
                  {/* Agrega más columnas si tu API retorna más info */}
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fabrics.map((fabric) => (
                  <TableRow key={fabric.id}>
                    <TableCell>{fabric.id}</TableCell>
                    <TableCell>{fabric.description}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        onClick={() => handleSelectFabric(fabric.id)}
                      >
                        Seleccionar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFabricDialog}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default OrdenesServicio;
