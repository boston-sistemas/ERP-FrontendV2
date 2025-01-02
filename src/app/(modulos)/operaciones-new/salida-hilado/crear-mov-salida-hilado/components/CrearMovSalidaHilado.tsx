"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableRow,
  TableCell,
  Button,
  Checkbox,
  Collapse,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TablePagination,
} from "@mui/material";
import { Add, ExpandMore, ExpandLess } from "@mui/icons-material";
import {
  fetchYarnPurchaseEntries,
  fetchYarnPurchaseEntryDetails,
} from "../../../ingreso-hilado/services/movIngresoHiladoService";
import { createYarnDispatch } from "../../services/movSalidaHiladoService";

const CrearMovSalidaHilado: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [ingresos, setIngresos] = useState<any[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<any[]>([]);
  const [openRows, setOpenRows] = useState<Record<number, boolean>>({});
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(10);

  useEffect(() => {
    const savedEntry = localStorage.getItem("entryNumber");
    if (savedEntry) {
      const { entryNumber } = JSON.parse(savedEntry);
      loadIngresoDetails(entryNumber);
      localStorage.removeItem("entryNumber");
    } else {
      loadIngresos();
    }
  }, []);

  const loadIngresos = async () => {
    try {
      const period = new Date().getFullYear();
      const response = await fetchYarnPurchaseEntries(period, 50, 0);
      setIngresos(response.yarnPurchaseEntries || []);
    } catch (error) {
      console.error("Error al cargar los movimientos de ingreso:", error);
    }
  };

  const loadIngresoDetails = async (entryNumber: string) => {
    try {
      const period = new Date().getFullYear();
      const response = await fetchYarnPurchaseEntryDetails(entryNumber, period);
      setData(response);
    } catch (error) {
      console.error("Error al cargar detalles del ingreso:", error);
    }
  };

  const toggleRow = (index: number) => {
    setOpenRows((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  const toggleGroupSelection = (group: any) => {
    setSelectedGroups((prev) =>
      prev.find((g) => g.groupNumber === group.groupNumber)
        ? prev.filter((g) => g.groupNumber !== group.groupNumber)
        : [...prev, group]
    );
  };

  const handleSaveSalida = async () => {
    if (!data) {
      alert("No hay datos cargados.");
      return;
    }

    if (selectedGroups.length === 0) {
      alert("Debe seleccionar al menos un grupo para generar la salida.");
      return;
    }

    const payload = {
      entryNumber: data.entryNumber,
      detail: selectedGroups.map((group) => ({
        entryGroupNumber: group.groupNumber,
        coneCount: group.coneCount,
        packageCount: group.packageCount,
        grossWeight: group.grossWeight,
        netWeight: group.netWeight,
      })),
    };

    try {
      await createYarnDispatch(payload);
      alert("Movimiento de salida creado exitosamente.");
    } catch (error) {
      console.error("Error al guardar el movimiento de salida:", error);
    }
  };

  const handleOpenDialog = () => setIsDialogOpen(true);
  const handleCloseDialog = () => setIsDialogOpen(false);

  const handleSelectIngresoFromDialog = (entryNumber: string) => {
    loadIngresoDetails(entryNumber);
    handleCloseDialog();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-lg">
          Movimiento de Ingreso Asociado: {data ? <strong>{data.entryNumber}</strong> : "Ninguno"}
        </p>
        <IconButton color="primary" onClick={handleOpenDialog}>
          <Add />
        </IconButton>
      </div>

      {data && (
        <div className="max-w-full overflow-x-auto">
          {data.detail.map((item: any, index: number) => (
            <React.Fragment key={index}>
              <h2 className="text-lg font-semibold mb-2">Hilado {index + 1}: {item.yarnId}</h2>
              <table className="w-full table-auto mb-4">
                <thead>
                  <tr className="bg-blue-900 uppercase text-center text-white">
                    <th className="px-4 py-4 font-normal">Grupo</th>
                    <th className="px-4 py-4 font-normal">Peso Guía</th>
                    <th className="px-4 py-4 font-normal">Estado</th>
                    <th className="px-4 py-4 font-normal">Bultos Restantes</th>
                    <th className="px-4 py-4 font-normal">Seleccionar</th>
                  </tr>
                </thead>
                <tbody>
                  {item.detailHeavy.map((group: any, groupIndex: number) => (
                    <TableRow key={groupIndex} className="text-center">
                      <TableCell className="border-b border-gray-300 px-4 py-5">
                        {group.groupNumber}
                      </TableCell>
                      <TableCell className="border-b border-gray-300 px-4 py-5">
                        {group.grossWeight}
                      </TableCell>
                      <TableCell
                        className="border-b border-gray-300 px-4 py-5 text-red-500"
                      >
                        No Despachado
                      </TableCell>
                      <TableCell className="border-b border-gray-300 px-4 py-5">
                        {group.packageCount}
                      </TableCell>
                      <TableCell className="border-b border-gray-300 px-4 py-5">
                        <Checkbox
                          checked={selectedGroups.some(
                            (g) => g.groupNumber === group.groupNumber
                          )}
                          onChange={() => toggleGroupSelection(group)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </tbody>
              </table>
            </React.Fragment>
          ))}
        </div>
      )}

<Dialog
  open={isDialogOpen}
  onClose={handleCloseDialog}
  fullWidth
  maxWidth="lg"
  PaperProps={{
    style: {
      marginLeft: "300px", // Ajusta este valor según el ancho de la barra lateral
      maxWidth: "calc(100% - 240px)", // Asegura que no se superponga
    },
  }}
>
  <DialogTitle>Seleccionar Movimiento de Ingreso</DialogTitle>
  <DialogContent>
    <div className="max-w-full overflow-x-auto">
      <table className="w-full table-auto">
        <thead>
          <tr className="bg-blue-900 text-white">
            <th className="px-4 py-4 font-normal">Número</th>
            <th className="px-4 py-4 font-normal">Proveedor</th>
            <th className="px-4 py-4 font-normal">Fecha</th>
            <th className="px-4 py-4 font-normal">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ingresos
            .slice(pagina * filasPorPagina, pagina * filasPorPagina + filasPorPagina)
            .map((ingreso) => (
              <TableRow key={ingreso.entryNumber} className="text-center">
                <TableCell className="border-b border-gray-300 px-4 py-5">
                  {ingreso.entryNumber}
                </TableCell>
                <TableCell className="border-b border-gray-300 px-4 py-5">
                  {ingreso.supplierCode}
                </TableCell>
                <TableCell className="border-b border-gray-300 px-4 py-5">
                  {ingreso.creationDate}
                </TableCell>
                <TableCell className="border-b border-gray-300 px-4 py-5">
                      {data?.entryNumber === ingreso.entryNumber ? (
                        <span className="text-blue-600 font-semibold">Seleccionado</span>
                      ) : (
                        <IconButton
                          color="primary"
                          onClick={() => handleSelectIngresoFromDialog(ingreso.entryNumber)}
                        >
                          <Add />
                        </IconButton>
                      )}
                    </TableCell>
              </TableRow>
            ))}
        </tbody>
      </table>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={ingresos.length}
        rowsPerPage={filasPorPagina}
        page={pagina}
        onPageChange={(_, newPage) => setPagina(newPage)}
        onRowsPerPageChange={(e) => setFilasPorPagina(parseInt(e.target.value, 10))}
      />
    </div>
  </DialogContent>
  <DialogActions>
    <Button onClick={handleCloseDialog} color="secondary">
      Cancelar
    </Button>
  </DialogActions>
</Dialog>

      {data && (
        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveSalida}
          style={{ marginTop: "16px" }}
        >
          Guardar Salida
        </Button>
      )}
    </div>
  );
};

export default CrearMovSalidaHilado;
