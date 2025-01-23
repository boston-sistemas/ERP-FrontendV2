"use client";

import React, { useState, useEffect } from "react";
import {
  TablePagination,
  IconButton,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  Typography,
  Dialog,
  DialogContent,
} from "@mui/material";
import { Visibility, Add, Search } from "@mui/icons-material";
import { useRouter, useSearchParams } from "next/navigation";
import { YarnPurchaseEntry } from "../../../models/models";
import {
  fetchYarnPurchaseEntries,
  fetchSuppliersHil,
  fetchPurchaseOrderbyId,
} from "../../services/movIngresoHiladoService";

const MovIngresoHilado: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [hilados, setHilados] = useState<YarnPurchaseEntry[]>([]);
  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [period, setPeriod] = useState(2025); // Período inicial
  const [suppliers, setSuppliers] = useState([]);
  const [openPurchaseOrderDialog, setOpenPurchaseOrderDialog] = useState(false);
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const dataSuppliers = await fetchSuppliersHil();
        const response = await fetchYarnPurchaseEntries(
          period, // Periodo dinámico
          filasPorPagina,
          pagina * filasPorPagina,
          includeInactive
        );
        setHilados(response.yarnPurchaseEntries);
        setSuppliers(dataSuppliers.suppliers);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [pagina, filasPorPagina, includeInactive, period]);

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIncludeInactive(event.target.checked);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleCreateMovIngresoHilado = () => {
    router.push("/operaciones-new/ingreso-hilado/crear-mov-ingreso-hilado");
  };

  const handleDetailsClick = (entryNumber: string) => {
    localStorage.setItem("selectedPeriod", JSON.stringify(period)); // Guarda el periodo en localStorage
    router.push(`/operaciones-new/ingreso-hilado/detalles-mov-ingreso-hilado/${entryNumber}`); // Redirige al componente de detalles
  };

  const fetchOCbyId = async (purchaseOrderNumber: string) => {
    try {
      const data = await fetchPurchaseOrderbyId(purchaseOrderNumber);
      setSelectedPurchaseOrder(data);
    } catch (error) {
      console.error("Error al obtener la orden de compra:", error);
    }
  };

  const handlePurchaseOrderClick = async (purchaseOrderNumber: string) => {
  setOpenPurchaseOrderDialog(true); // Abre el diálogo
  setSelectedPurchaseOrder(null); // Limpia datos previos
  try {
    const data = await fetchPurchaseOrderbyId(purchaseOrderNumber); // Llama a la función API
    setSelectedPurchaseOrder(data); // Guarda los datos en el estado
  } catch (error) {
    console.error("Error al cargar la orden de compra:", error);
  }
};


  const filteredHilados = hilados.filter((hilado) =>
    Object.values(hilado).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="space-y-5">
      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="max-w-full overflow-x-auto">
          <div className="flex items-center justify-between gap-2 mb-4">
            {/* Contenedor de Período, Búsqueda y Switch */}
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
                    onChange={handleSwitchChange}
                    color="primary"
                  />
                }
                label="Mostrar inactivos"
              />
              <div className="flex items-center gap-2">
                <Typography variant="body2" className="font-semibold">
                  Período:
                </Typography>
                <Select
                  value={period}
                  onChange={(e) => setPeriod(Number(e.target.value))}
                  displayEmpty
                  variant="outlined"
                  size="small"
                  style={{ width: "120px", backgroundColor: "#fff" }}
                >
                  {[2023, 2024, 2025].map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </div>
            </div>

            {/* Botón Crear */}
            <div className="flex items-center gap-2">
              <Button
                startIcon={<Add />}
                variant="contained"
                style={{ backgroundColor: "#1976d2", color: "#fff" }}
                onClick={handleCreateMovIngresoHilado}
              >
                CREAR
              </Button>
            </div>
          </div>

          {/* Tabla de Movimientos */}
          <div className="max-w-full overflow-x-auto">
            <table className="w-full table-auto ">
              <thead>
                <tr className="bg-blue-900 uppercase text-center">
                  {[
                    "Nro Ingreso",
                    "Periodo",
                    "Fecha",
                    "Proveedor",
                    "Estado",
                    "Nro O/C",
                    "Lote Proveedor",
                    "Lote Mecsa",
                    "Detalles/Edición",
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
                    <td colSpan={10} className="text-center py-4">
                      Cargando datos...
                    </td>
                  </tr>
                ) : filteredHilados.length > 0 ? (
                  filteredHilados.map((hilado, index) => (
                    <tr key={index} className="text-center text-black">
                      <td className="border-b border-[#eee] px-4 py-5">
                        {hilado.entryNumber}
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5">
                        {hilado.period}
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5">
                        {hilado.creationDate}
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5">
                        {suppliers.map((supplier) =>
                          supplier.code === hilado.supplierCode
                            ? supplier.name
                            : ""
                        )}
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5">
                        {hilado.promecStatus.name}
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5">
                        {hilado.purchaseOrderNumber}
                        <IconButton
                          color="primary"
                          onClick={() =>
                            handlePurchaseOrderClick(
                              hilado.purchaseOrderNumber
                            )
                          }
                        >
                          <Visibility />
                        </IconButton>
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5">
                        {hilado.supplierBatch}
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5">
                        {hilado.mecsaBatch}
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5">
                        <IconButton
                          color="primary"
                          onClick={() => handleDetailsClick(hilado.entryNumber)}
                        >
                          <Visibility />
                        </IconButton>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="text-center py-4">
                      No se encontraron resultados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dialogo de Orden de Compra */}
        <Dialog
  open={openPurchaseOrderDialog}
  onClose={() => setOpenPurchaseOrderDialog(false)}
  maxWidth="md"
  fullWidth
>
  <DialogContent>
    {selectedPurchaseOrder ? (
      <div>
        <h1 className="text-lg font-semibold mb-4">
          Orden de Compra: {selectedPurchaseOrder.purchaseOrderNumber}
        </h1>
        <p><strong>Empresa:</strong> {selectedPurchaseOrder.companyCode}</p>
        <p><strong>Proveedor:</strong> {selectedPurchaseOrder.supplierCode}</p>
        <p><strong>Fecha de Emisión:</strong> {selectedPurchaseOrder.issueDate}</p>
        <p><strong>Fecha de Vencimiento:</strong> {selectedPurchaseOrder.dueDate}</p>
        <p><strong>Método de Pago:</strong> {selectedPurchaseOrder.paymentMethod}</p>
        <p><strong>Estado:</strong> {selectedPurchaseOrder.statusFlag}</p>
        <p><strong>Moneda:</strong> {selectedPurchaseOrder.currencyCode}</p>
        <h2 className="text-md font-semibold mt-4">Detalle:</h2>
        <table className="w-full mt-2">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2">Cantidad Ordenada</th>
              <th className="px-4 py-2">Cantidad Suministrada</th>
              <th className="px-4 py-2">Unidad</th>
              <th className="px-4 py-2">Descripción</th>
              <th className="px-4 py-2">Precio</th>
              <th className="px-4 py-2">Importe</th>
            </tr>
          </thead>
          <tbody>
            {selectedPurchaseOrder.detail.map((item, index) => (
              <tr key={index} className="text-center">
                <td className="border px-4 py-2">{item.quantityOrdered}</td>
                <td className="border px-4 py-2">{item.quantitySupplied}</td>
                <td className="border px-4 py-2">{item.unitCode}</td>
                <td className="border px-4 py-2">{item.yarn.description}</td>
                <td className="border px-4 py-2">{item.precto}</td>
                <td className="border px-4 py-2">{item.impcto}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <p>Cargando información...</p>
    )}
  </DialogContent>
</Dialog>

        {/* Paginación */}
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={hilados.length}
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
    </div>
  );
};

export default MovIngresoHilado;
