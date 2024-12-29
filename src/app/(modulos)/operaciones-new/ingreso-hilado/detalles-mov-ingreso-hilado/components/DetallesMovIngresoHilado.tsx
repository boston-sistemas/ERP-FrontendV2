"use client";

import React, { useState, useEffect } from "react";
import {
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  IconButton,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
} from "@mui/material";
import { Edit, ExpandMore, ExpandLess, Save, Cancel } from "@mui/icons-material";
import { useRouter, useParams } from "next/navigation";
import { fetchYarnPurchaseEntryDetails } from "../../services/movIngresoHiladoService";
import { YarnPurchaseEntry } from "../../../models/models";

const DetallesMovIngresoHilado: React.FC = () => {
  const router = useRouter();
  const { entryNumber } = useParams() as { entryNumber: string };
  const [detalle, setDetalle] = useState<YarnPurchaseEntry | null>(null);
  const [openRows, setOpenRows] = useState<Record<number, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedData, setEditedData] = useState<YarnPurchaseEntry | null>(null);

  // Cargar datos del movimiento
  useEffect(() => {
    const loadDetails = async () => {
      setIsLoading(true);
      try {
        if (entryNumber) {
          const period = new Date().getFullYear();
          const data = await fetchYarnPurchaseEntryDetails(entryNumber, period);
          setDetalle(data);
        }
      } catch (error) {
        console.error("Error al cargar los detalles del movimiento:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDetails();
  }, [entryNumber]);

  const toggleRow = (index: number) => {
    setOpenRows((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  const handleOpenEditDialog = () => {
    setEditedData({ ...detalle } as YarnPurchaseEntry);
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
  };

  const handleEditFieldChange = (field: keyof YarnPurchaseEntry, value: any) => {
    setEditedData((prevState) => ({
      ...prevState,
      [field]: value,
    }) as YarnPurchaseEntry);
  };

  const handleSaveChanges = async () => {
    try {
      console.log("Datos actualizados:", editedData);
      // Aquí harías el llamado al servicio para actualizar los datos con PATCH
      setDetalle(editedData);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error al guardar los cambios:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Typography variant="h6">Cargando detalles del movimiento...</Typography>
      </div>
    );
  }

  if (!detalle) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Typography variant="h6">
          No se encontraron detalles para este movimiento.
        </Typography>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-md border p-5 bg-gray-50 shadow-md">
        <div className="grid grid-cols-2 gap-4 text-sm mb-5">
          <div>
            <Typography style={{ color: "black" }}>
              <strong>N°:</strong> {detalle.entryNumber}
            </Typography>
            <Typography style={{ color: "black" }}>
              <strong>Proveedor:</strong> {detalle.supplierCode}
            </Typography>
            <Typography style={{ color: "black" }}>
              <strong>O/C N°:</strong> {detalle.purchaseOrderNumber}
            </Typography>
            <Typography style={{ color: "black" }}>
              <strong>Guía:</strong> {detalle.supplierPoCorrelative || "N/A"}
            </Typography>
            <Typography style={{ color: "black" }}>
              <strong>Factura:</strong> {detalle.supplierPoSeries || "N/A"}
            </Typography>
          </div>
          <div>
            <Typography style={{ color: "black" }}>
              <strong>Fecha Doc.:</strong> {detalle.fecgf}
            </Typography>
            <Typography style={{ color: "black" }}>
              <strong>Tipo de Cambio:</strong> {detalle.exchangeRate}
            </Typography>
            <Typography style={{ color: "black" }}>
              <strong>Moneda:</strong> {detalle.currencyCode === 2 ? "US$" : "Otra"}
            </Typography>
            <Typography style={{ color: "black" }}>
              <strong>Lote Mecsa:</strong> {detalle.mecsaBatch}
            </Typography>
            <Typography style={{ color: "black" }}>
              <strong>Lote Proveedor:</strong> {detalle.supplierBatch}
            </Typography>
          </div>
        </div>
        <Button
          startIcon={<Edit />}
          variant="contained"
          style={{ backgroundColor: "#0288d1", color: "#fff" }}
          onClick={handleOpenEditDialog}
        >
          Editar
        </Button>
      </div>

      {/* Tabla Resumen */}
      <TableContainer className="rounded-md border bg-gray-50 shadow-md mt-5">
        <Table>
          <TableHead className="bg-blue-900">
            <TableRow>
              {[
                "Item",
                "Código",
                "N° Bultos",
                "N° Conos",
                "Lote Mecsa",
                "% Difer.",
                "Peso Bruto",
                "Peso Neto",
                "Pesaje",
              ].map((col, index) => (
                <TableCell key={index} className="text-white text-center">
                  {col}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {detalle.detail.map((item, index) => (
              <React.Fragment key={index}>
                <TableRow>
                  <TableCell className="text-center">{item.itemNumber}</TableCell>
                  <TableCell className="text-center">{item.yarnId}</TableCell>
                  <TableCell className="text-center">{item.guidePackageCount}</TableCell>
                  <TableCell className="text-center">{item.guideConeCount}</TableCell>
                  <TableCell className="text-center">{detalle.mecsaBatch}</TableCell>
                  <TableCell className="text-center">00.00%</TableCell>
                  <TableCell className="text-center">{item.guideGrossWeight}</TableCell>
                  <TableCell className="text-center">{item.guideNetWeight}</TableCell>
                  <TableCell className="text-center">
                    <IconButton onClick={() => toggleRow(index)}>
                      {openRows[index] ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={10} style={{ padding: 0 }}>
                    <Collapse in={openRows[index]} timeout="auto" unmountOnExit>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            {["Grupo", "Peso Guía", "Estado", "Bultos Restantes"].map(
                              (subCol, subIndex) => (
                                <TableCell key={subIndex} className="text-center">
                                  {subCol}
                                </TableCell>
                              )
                            )}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {item.detailHeavy.map((group, groupIndex) => (
                            <TableRow key={groupIndex}>
                              <TableCell className="text-center">{group.groupNumber}</TableCell>
                              <TableCell className="text-center">{group.grossWeight}</TableCell>
                              <TableCell className="text-center" style={{ color: "red" }}>
                                No Despachado
                              </TableCell>
                              <TableCell className="text-center">{group.packageCount}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Botones de acción */}
      <div className="flex justify-between mt-5">
        <Button
          variant="contained"
          style={{ backgroundColor: "#0288d1", color: "#fff" }}
          onClick={() => router.push("/operaciones-new/ingreso-hilado")}
        >
          Regresar a Movimientos
        </Button>
        <Button
          variant="contained"
          style={{ backgroundColor: "#4caf50", color: "#fff" }}
          size="large"
        >
          Generar Salida
        </Button>
      </div>

      {/* Diálogo de Edición */}
      <Dialog open={isEditDialogOpen} onClose={handleCloseEditDialog} fullWidth maxWidth="md">
        <DialogTitle>Editar Movimiento</DialogTitle>
        <DialogContent>
          <div className="grid grid-cols-2 gap-4">
            <TextField
              label="Guía"
              value={editedData?.supplierPoCorrelative || ""}
              onChange={(e) =>
                handleEditFieldChange("supplierPoCorrelative", e.target.value)
              }
              fullWidth
            />
            <TextField
              label="Factura"
              value={editedData?.supplierPoSeries || ""}
              onChange={(e) => handleEditFieldChange("supplierPoSeries", e.target.value)}
              fullWidth
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            startIcon={<Cancel />}
            onClick={handleCloseEditDialog}
            color="secondary"
          >
            Cancelar
          </Button>
          <Button
            startIcon={<Save />}
            onClick={handleSaveChanges}
            color="primary"
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DetallesMovIngresoHilado;
