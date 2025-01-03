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
  Tooltip,
} from "@mui/material";
import { Edit, ExpandMore, ExpandLess, Save, Cancel, Add, Delete, Block } from "@mui/icons-material";
import { useRouter, useParams } from "next/navigation";
import { fetchYarnPurchaseEntryDetails, updateYarnPurchaseEntry, anulateYarnPurchaseEntry,
  checkIfYarnPurchaseEntryIsUpdatable, } from "../../services/movIngresoHiladoService";
import { YarnPurchaseEntry } from "../../../models/models";

const DetallesMovIngresoHilado: React.FC = () => {
  const router = useRouter();
  const { entryNumber } = useParams() as { entryNumber: string };
  const [detalle, setDetalle] = useState<YarnPurchaseEntry | null>(null);
  const [openRows, setOpenRows] = useState<Record<number, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isEditable, setIsEditable] = useState(false);
  const [isAnulable, setIsAnulable] = useState(false);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedData, setEditedData] = useState<YarnPurchaseEntry | null>(null);

  const handleGenerateSalida = () => {
    if (detalle) {
      const payload = {
        entryNumber: detalle.entryNumber,
        groups: detalle.detail.map((item) => ({
          groupNumber: item.itemNumber, // Usar groupNumber o cualquier identificador único
          coneCount: item.guideConeCount,
          packageCount: item.guidePackageCount,
          grossWeight: item.guideGrossWeight,
          netWeight: item.guideNetWeight,
        })),
      };
      
      localStorage.setItem("entryNumber", JSON.stringify(payload));
      router.push(
        `/operaciones-new/salida-hilado/crear-mov-salida-hilado`);
    }
  };
    

  // Cargar datos del movimiento
  const initializeDetailHeavy = (detail: YarnPurchaseEntry["detail"]) =>
    detail.map((item) => ({
      ...item,
      detailHeavy: item.detailHeavy || [], // Inicializa como un array vacío si no existe
    }));
  
    useEffect(() => {
      const loadDetails = async () => {
        setIsLoading(true);
        try {
          if (entryNumber) {
            const period = 2024;
    
            // Llama a los servicios necesarios
            const data = await fetchYarnPurchaseEntryDetails(entryNumber, period);
            const updatableResponse = await checkIfYarnPurchaseEntryIsUpdatable(entryNumber);
    
            // Actualiza los estados con base en la respuesta
            setDetalle(data);
            setIsEditable(updatableResponse.updatable); // Basado en el campo `updatable` de la respuesta
            setIsAnulable(updatableResponse.updatable); // Igual que `isEditable`
          }
        } catch (error) {
          //console.error("Error al cargar los detalles del movimiento:", error);
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

  const handleAnulateEntry = async (entryNumber: string) => {
    try {
      await anulateYarnPurchaseEntry(entryNumber);
      alert(`Movimiento de ingreso N° ${entryNumber} anulado con éxito.`);
      setDetalle((prev) =>
        prev
          ? {
              ...prev,
              statusFlag: "A", // Actualiza el estado del movimiento a "Anulado".
            }
          : null
      );
      setIsEditable(false); // Deshabilita la edición.
      setIsAnulable(false); // Deshabilita la anulación.
    } catch (error) {
      console.error(`Error al anular el movimiento N° ${entryNumber}:`, error);
      //alert("Ocurrió un error al intentar anular el movimiento.");
    }
  };
  
  const handleSaveChanges = async () => {
    if (!editedData || !editedData.entryNumber) {
      //console.error("No hay datos para guardar.");
      return;
    }

    try {
      // Prepara el payload basado en los datos editados
      const payload: Partial<YarnPurchaseEntry> = {
        period: 2024,
        supplierPoCorrelative: editedData.supplierPoCorrelative,
        supplierPoSeries: editedData.supplierPoSeries,
        fecgf: editedData.fecgf,
        purchaseOrderNumber: editedData.purchaseOrderNumber,
        documentNote: editedData.documentNote || "",
        supplierBatch: editedData.supplierBatch,
        detail: editedData.detail.map((detail, index) => ({
          itemNumber: detail.itemNumber || index + 1, // Usa itemNumber o un índice por defecto
          yarnId: detail.yarnId,
          guideNetWeight: detail.guideNetWeight,
          guideGrossWeight: detail.guideGrossWeight,
          guidePackageCount: detail.guidePackageCount,
          guideConeCount: detail.guideConeCount,
          detailHeavy: detail.detailHeavy, // Incluye detailHeavy solo si isWeighted es true
          isWeighted: detail.isWeighted,
          statusFlag: "P", // Asegura que siempre se envíe el mismo flag
        })),
      };
  
      const period = new Date().getFullYear();
  
      // Llama al servicio de actualización con el payload
      await updateYarnPurchaseEntry(editedData.entryNumber, period, payload);
  
      // Actualiza el estado con los datos editados
      setDetalle(editedData);
      setIsEditDialogOpen(false);
      //console.log("Movimiento actualizado correctamente.");
    } catch (error) {
      //console.error("Error al guardar los cambios:", error);
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
        <Tooltip
  title={isEditable ? "" : "El movimiento de ingreso no es editable"}
  arrow
>
  <span>
    <Button
      startIcon={<Edit />}
      variant="contained"
      style={{
        backgroundColor: isEditable ? "#0288d1" : "#b0b0b0",
        color: "#fff",
        marginRight: "10px",
      }}
      onClick={isEditable ? handleOpenEditDialog : undefined}
      disabled={!isEditable}
    >
      Editar
    </Button>
  </span>
</Tooltip>

<Tooltip
  title={isAnulable ? "" : "El movimiento de ingreso no se puede anular"}
  arrow
>
  <span>
    <Button
      startIcon={<Block />}
      variant="contained"
      style={{
        backgroundColor: isAnulable ? "#d32f2f" : "#b0b0b0",
        color: "#fff",
      }}
      onClick={isAnulable ? () => handleAnulateEntry(entryNumber) : undefined}
      disabled={!isAnulable}
    >
      Anular
    </Button>
  </span>
</Tooltip>

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
              ...(detalle.detail.some((item) => item.isWeighted) ? ["Pesaje"] : []), // Muestra "Pesaje" solo si isWeighted es true
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
        {item.isWeighted && ( // Oculta la columna "Pesaje" si isWeighted es false
          <TableCell className="text-center">
            <IconButton onClick={() => toggleRow(index)}>
              {openRows[index] ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </TableCell>
        )}
      </TableRow>
      {item.isWeighted && (
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
      )}
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
        onClick={handleGenerateSalida}
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
        {/* Diálogo de Edición */}
<Dialog open={isEditDialogOpen} onClose={handleCloseEditDialog} fullWidth maxWidth="md">
  <DialogTitle>Editar Movimiento de Ingreso</DialogTitle>
  <DialogContent>
    <div className="mb-4">
      <Typography
        variant="subtitle1"
        className="font-semibold mb-2"
        style={{ color: "#000" }}
      >
        Seleccionar Orden de Compra
      </Typography>
      {editedData?.purchaseOrderNumber && (
        <Typography
          variant="body2"
          className="mb-2 font-semibold"
          style={{ color: "#000" }}
        >
          Orden seleccionada: {editedData.purchaseOrderNumber}
        </Typography>
      )}
    </div>
    <div className="grid grid-cols-2 gap-4 mb-4">
      <TextField
        label="Guía"
        value={editedData?.supplierPoCorrelative || ""}
        onChange={(e) => handleEditFieldChange("supplierPoCorrelative", e.target.value)}
        fullWidth
        variant="outlined"
        size="small"
      />
      <TextField
        label="Factura"
        value={editedData?.supplierPoSeries || ""}
        onChange={(e) => handleEditFieldChange("supplierPoSeries", e.target.value)}
        fullWidth
        variant="outlined"
        size="small"
      />
      <TextField
        label="Lte. Provee."
        value={editedData?.supplierBatch || ""}
        onChange={(e) => handleEditFieldChange("supplierBatch", e.target.value)}
        fullWidth
        variant="outlined"
        size="small"
      />
    </div>
    {/* Hilados dinámicos */}
    {editedData?.detail?.map((detail, index) => (
  <div key={index} className="mb-6">
    <Typography
      variant="subtitle1"
      className="font-semibold mb-2"
      style={{ color: "#000" }}
    >
      Hilado: {detail.yarnId}
    </Typography>
    <div className="grid grid-cols-2 gap-4">
      <TextField
        label="N° Bultos General"
        value={detail.guidePackageCount || ""}
        onChange={(e) =>
          setEditedData((prevState) =>
            prevState
              ? {
                  ...prevState,
                  detail: prevState.detail.map((d, i) =>
                    i === index
                      ? { ...d, guidePackageCount: parseInt(e.target.value) || 0 }
                      : d
                  ),
                }
              : null
          )
        }
        fullWidth
        variant="outlined"
        size="small"
      />
      <TextField
        label="N° Conos"
        value={detail.guideConeCount || ""}
        onChange={(e) =>
          setEditedData((prevState) =>
            prevState
              ? {
                  ...prevState,
                  detail: prevState.detail.map((d, i) =>
                    i === index
                      ? { ...d, guideConeCount: parseInt(e.target.value) || 0 }
                      : d
                  ),
                }
              : null
          )
        }
        fullWidth
        variant="outlined"
        size="small"
      />
      <TextField
        label="Peso Bruto"
        value={detail.guideGrossWeight || ""}
        onChange={(e) =>
          setEditedData((prevState) =>
            prevState
              ? {
                  ...prevState,
                  detail: prevState.detail.map((d, i) =>
                    i === index
                      ? { ...d, guideGrossWeight: parseFloat(e.target.value) || 0 }
                      : d
                  ),
                }
              : null
          )
        }
        fullWidth
        variant="outlined"
        size="small"
      />
      <TextField
        label="Peso Neto"
        value={detail.guideNetWeight || ""}
        onChange={(e) =>
          setEditedData((prevState) =>
            prevState
              ? {
                  ...prevState,
                  detail: prevState.detail.map((d, i) =>
                    i === index
                      ? { ...d, guideNetWeight: parseFloat(e.target.value) || 0 }
                      : d
                  ),
                }
              : null
          )
        }
        fullWidth
        variant="outlined"
        size="small"
      />
    </div>
        <div className="flex items-center justify-between mt-4">
          <Typography variant="subtitle1" className="font-semibold">
            Pesaje
          </Typography>
          <Switch
            checked={detail.isWeighted || false}
            onChange={(e) =>
              setEditedData((prevState) =>
                prevState ? {
                  ...prevState,
                  detail: prevState.detail.map((d, i) =>
                    i === index ? { ...d, isWeighted: e.target.checked } : d
                  ),
                } : null
              )
            }
            color="primary"
          />
        </div>
        {detail.isWeighted && (
          <div className="mb-4">
            <table className="table-auto w-full">
              <thead>
                <tr className="bg-blue-900 text-white text-sm">
                  {["Grupo", "N° Bultos", "N° Conos", "Peso Bruto", "Peso Neto", "Acciones"].map(
                    (col, colIndex) => (
                      <th key={colIndex} className="px-2 py-3 text-center">
                        {col}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {detail.detailHeavy?.map((group, groupIndex) => (
                  <tr key={groupIndex} className="hover:bg-gray-200 text-sm">
                    <td className="px-2 py-3 text-center">{group.groupNumber}</td>
                    <td className="px-2 py-3 text-center">
                      <TextField
                        type="number"
                        size="small"
                        fullWidth
                        value={1}
                        InputProps={{ readOnly: true }} // Siempre será 1
                      />
                    </td>
                    <td className="px-2 py-3 text-center">
                      <TextField
                        type="number"
                        size="small"
                        fullWidth
                        value={group.coneCount || ""}
                        onChange={(e) =>
                          setEditedData((prevState) =>
                            prevState ? {
                              ...prevState,
                              detail: prevState.detail.map((d, i) =>
                                i === index
                                  ? {
                                      ...d,
                                      detailHeavy: d.detailHeavy.map((g, gi) =>
                                        gi === groupIndex
                                          ? { ...g, coneCount: parseInt(e.target.value) || 0 }
                                          : g
                                      ),
                                    }
                                  : d
                              ),
                            } : null
                          )
                        }
                      />
                    </td>
                    <td className="px-2 py-3 text-center">
                      <TextField
                        type="number"
                        size="small"
                        fullWidth
                        value={group.grossWeight || ""}
                        onChange={(e) =>
                          setEditedData((prevState) =>
                            prevState ? {
                              ...prevState,
                              detail: prevState.detail.map((d, i) =>
                                i === index
                                  ? {
                                      ...d,
                                      detailHeavy: d.detailHeavy.map((g, gi) =>
                                        gi === groupIndex
                                          ? { ...g, grossWeight: parseFloat(e.target.value) || 0 }
                                          : g
                                      ),
                                    }
                                  : d
                              ),
                            } : null
                          )
                        }
                      />
                    </td>
                    <td className="px-2 py-3 text-center">
                      <TextField
                        type="number"
                        size="small"
                        fullWidth
                        value={group.netWeight || ""}
                        onChange={(e) =>
                          setEditedData((prevState) =>
                            prevState ? {
                              ...prevState,
                              detail: prevState.detail.map((d, i) =>
                                i === index
                                  ? {
                                      ...d,
                                      detailHeavy: d.detailHeavy.map((g, gi) =>
                                        gi === groupIndex
                                          ? { ...g, netWeight: parseFloat(e.target.value) || 0 }
                                          : g
                                      ),
                                    }
                                  : d
                              ),
                            } : null
                          )
                        }
                      />
                    </td>
                    <td className="px-2 py-3 text-center">
                      <IconButton
                        color="error"
                        onClick={() =>
                          setEditedData((prevState) =>
                            prevState ? {
                              ...prevState,
                              detail: prevState.detail.map((d, i) =>
                                i === index
                                  ? {
                                      ...d,
                                      detailHeavy: d.detailHeavy.filter(
                                        (_, gi) => gi !== groupIndex
                                      ),
                                    }
                                  : d
                              ),
                            } : null
                          )
                        }
                      >
                        <Delete />
                      </IconButton>
                    </td>
                  </tr>
                ))} 
              </tbody>
            </table>
            <div className="flex justify-end mt-2">
              <IconButton
                color="primary"
                onClick={() =>
                  setEditedData((prevState) =>
                    prevState ? {
                      ...prevState,
                      detail: prevState.detail.map((d, i) =>
                        i === index
                          ? {
                              ...d,
                              detailHeavy: [
                                ...d.detailHeavy,
                                {
                                  groupNumber: d.detailHeavy.length + 1,
                                  coneCount: 0,
                                  packageCount: 1,
                                  grossWeight: 0,
                                  netWeight: 0,
                                },
                              ],
                            }
                          : d
                      ),
                    } : null
                  )
                }
              >
                <Add />
              </IconButton>
            </div>
          </div>
        )}
      </div>
    ))}
  </DialogContent>
  <DialogActions>
    <Button
      onClick={handleCloseEditDialog}
      style={{ backgroundColor: "#d32f2f", color: "#fff" }}
    >
      Cancelar
    </Button>
    <Button
      onClick={handleSaveChanges}
      style={{ backgroundColor: "#1976d2", color: "#fff" }}
    >
      Guardar
    </Button>
  </DialogActions>
</Dialog>

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
