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
  Switch,
  FormControlLabel,
} from "@mui/material";
import { FilterList, Search, Visibility, Add, Delete } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { fetchServiceOrders, fetchSuppliers, createServiceOrder } from "../../services/ordenesServicioService";
import { ServiceOrder, Supplier } from "../../../models/models";

const OrdenesServicio: React.FC = () => {
  const router = useRouter();
  const [ordenesServicio, setOrdenesServicio] = useState<ServiceOrder[]>([]);
  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({ supplierId: "", issueDate: "" });
  const [includeInactive, setIncludeInactive] = useState(false); // Nuevo estado

  // Estado para el diálogo de creación
  const [openDialog, setOpenDialog] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [newOrder, setNewOrder] = useState({
    supplierId: "",
    detail: [
      { tissueId: "", quantityOrdered: 0, price: 0 },
    ],
  });

  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers.find((s) => s.code === supplierId);
    return supplier ? supplier.name : supplierId;
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleDetailsClick = (id: string) => {
    router.push(`/operaciones-new/ordenes-servicio/detalles/${id}`);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleAddDetailRow = () => {
    setNewOrder((prev) => ({
      ...prev,
      detail: [...prev.detail, { tissueId: "", quantityOrdered: 0, price: 0 }],
    }));
  };

  const handleDeleteDetailRow = (index: number) => {
    setNewOrder((prev) => ({
      ...prev,
      detail: prev.detail.filter((_, i) => i !== index),
    }));
  };

  const handleInputChange = (index: number, field: string, value: string | number) => {
    const updatedDetails = [...newOrder.detail];
    (updatedDetails[index] as any)[field] = value;
    setNewOrder((prev) => ({ ...prev, detail: updatedDetails }));
  };

  const handleCreateOrder = async () => {
    try {
      await createServiceOrder(newOrder);
      setOpenDialog(false);
      setNewOrder({
        supplierId: "",
        detail: [{ tissueId: "", quantityOrdered: 0, price: 0 }],
      });
      fetchOrders(); // Refetch orders after creation
    } catch (err) {
      console.error("Error al crear la orden de servicio", err);
      alert("No se pudo crear la orden. Verifica los datos e intenta nuevamente.");
    }
  };

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchServiceOrders(filasPorPagina, pagina * filasPorPagina, includeInactive);
      setOrdenesServicio(response.serviceOrders || []);
    } catch (err) {
      setError("Error al cargar las órdenes de servicio.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [pagina, filasPorPagina, includeInactive]);

  useEffect(() => {
    const fetchSuppliersData = async () => {
      try {
        const response = await fetchSuppliers();
        setSuppliers(response);
      } catch (err) {
        console.error("Error al cargar los proveedores", err);
        setSuppliers([]);
      }
    };
    fetchSuppliersData();
  }, []);

  const filteredOrdenes = ordenesServicio.filter((orden) =>
    Object.values(orden).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="space-y-5">
      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="max-w-full overflow-x-auto">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center border border-gray-300 rounded-md px-2">
                <Search />
                <TextField
                  variant="standard"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={handleSearch}
                  InputProps={{
                    disableUnderline: true,
                  }}
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
              <Menu
                anchorEl={filterAnchorEl}
                open={Boolean(filterAnchorEl)}
                onClose={handleFilterClose}
              >
                <div className="p-4 space-y-2" style={{ maxWidth: "300px", margin: "0 auto" }}>
                  <TextField
                    label="Proveedor"
                    variant="outlined"
                    placeholder="Filtrar por proveedor..."
                    size="small"
                    fullWidth
                    value={filters.supplierId}
                    onChange={(e) =>
                      setFilters({ ...filters, supplierId: e.target.value })
                    }
                  />
                  <TextField
                    label="Fecha Emisión"
                    type="date"
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    size="small"
                    fullWidth
                    value={filters.issueDate}
                    onChange={(e) =>
                      setFilters({ ...filters, issueDate: e.target.value })
                    }
                  />
                </div>
              </Menu>
            </div>
            <Button
              startIcon={<Add />}
              variant="contained"
              style={{ backgroundColor: "#1976d2", color: "#fff" }}
              onClick={handleOpenDialog}
            >
              Crear
            </Button>
          </div>

          {/* Tabla de Órdenes de Servicio */}
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-blue-900 uppercase text-center">
                {[
                  "No. Servicio",
                  "Proveedor",
                  "Fecha Emisión",
                  "Código Almacén",
                  "Estado",
                  "Detalles",
                ].map((col, index) => (
                  <th
                    key={index}
                    className="px-4 py-4 text-center font-normal text-white"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-4">
                    Cargando datos...
                  </td>
                </tr>
              ) : filteredOrdenes.length > 0 ? (
                filteredOrdenes.map((orden) => (
                  <tr key={orden.id} className="text-center">
                    <td className="border-b border-[#eee] px-4 py-5">{orden.id}</td>
                    <td className="border-b border-[#eee] px-4 py-5">{getSupplierName(orden.supplierId)}</td>
                    <td className="border-b border-[#eee] px-4 py-5">{orden.issueDate}</td>
                    <td className="border-b border-[#eee] px-4 py-5">{orden.storageCode}</td>
                    <td className="border-b border-[#eee] px-4 py-5">{orden.statusFlag}</td>
                    <td className="border-b border-[#eee] px-4 py-5">
                      <IconButton onClick={() => handleDetailsClick(orden.id)}>
                        <Visibility />
                      </IconButton>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-4">
                    No se encontraron resultados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

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
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
        />
      </div>

      {/* Dialog para crear una nueva orden */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>Crear Nueva Orden de Servicio</DialogTitle>
        <DialogContent>
          <div className="space-y-4">
            <Select
              value={newOrder.supplierId}
              onChange={(e) => setNewOrder({ ...newOrder, supplierId: e.target.value })}
              fullWidth
              displayEmpty
            >
              <MenuItem value="" disabled>
                Seleccione un proveedor
              </MenuItem>
              {suppliers.map((supplier) => (
                <MenuItem key={supplier.code} value={supplier.code}>
                  {supplier.name}
                </MenuItem>
              ))}
            </Select>
            {newOrder.detail.map((detail, index) => (
              <div key={index} className="flex space-x-4 items-center">
                <TextField
                  label="Código del tejido"
                  value={detail.tissueId}
                  onChange={(e) => handleInputChange(index, "tissueId", e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Cantidad"
                  type="number"
                  value={detail.quantityOrdered}
                  onChange={(e) => handleInputChange(index, "quantityOrdered", Number(e.target.value))}
                  fullWidth
                />
                <TextField
                  label="Precio"
                  type="number"
                  value={detail.price}
                  onChange={(e) => handleInputChange(index, "price", Number(e.target.value))}
                  fullWidth
                />
                <IconButton onClick={() => handleDeleteDetailRow(index)} color="error">
                  <Delete />
                </IconButton>
              </div>
            ))}
            <Button onClick={handleAddDetailRow} variant="contained" style={{ backgroundColor: "#1976d2", color: "#fff" }}>
              Agregar Detalle
            </Button>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} style={{ backgroundColor: "#d32f2f", color: "#fff" }}>
            Cancelar
          </Button>
          <Button onClick={handleCreateOrder} style={{ backgroundColor: "#1976d2", color: "#fff" }}>
            Crear
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default OrdenesServicio;
