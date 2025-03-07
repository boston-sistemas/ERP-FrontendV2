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
  Snackbar,
  Alert,
} from "@mui/material";
import { Edit, ExpandMore, ExpandLess, Save, Cancel, Add, Delete, Block, Visibility as VisibilityIcon } from "@mui/icons-material";
import { useRouter, useParams } from "next/navigation";
import { fetchYarnPurchaseEntryDetails, updateYarnPurchaseEntry, anulateYarnPurchaseEntry,
  checkIfYarnPurchaseEntryIsUpdatable, } from "../../services/movIngresoHiladoService";
import { YarnPurchaseEntry } from "../../../models/models";
import { fetchYarnbyId } from "../../../hilados/services/hiladoService";

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

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  const [openYarnDialog, setOpenYarnDialog] = useState(false);
  const [selectedYarn, setSelectedYarn] = useState(null);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isMediumScreen, setIsMediumScreen] = useState(false);

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  
  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };  

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
          const savedPeriod = localStorage.getItem("selectedPeriod");
          const period = savedPeriod ? JSON.parse(savedPeriod) : 2024;
    
          if (entryNumber) {
            const data = await fetchYarnPurchaseEntryDetails(entryNumber, period);
            const updatableResponse = await checkIfYarnPurchaseEntryIsUpdatable(entryNumber, period);
    
            setDetalle(data);
            setIsEditable(updatableResponse.updatable);
            setIsAnulable(updatableResponse.updatable);
          }
        } catch (error) {
          showSnackbar("Error al cargar los detalles del movimiento.", "error");
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

  const handleAnulateEntry = async (entryNumber: string) => {
    try {
      const savedPeriod = localStorage.getItem("selectedPeriod");
      const period = savedPeriod ? JSON.parse(savedPeriod) : 2024;

      await anulateYarnPurchaseEntry(entryNumber, period);
      showSnackbar(`Movimiento de ingreso N° ${entryNumber} anulado con éxito.`, "success");
      setDetalle((prev) =>
        prev
          ? {
              ...prev,
              statusFlag: "A",
            }
          : null
      );
      setIsEditable(false);
      setIsAnulable(false);
    } catch (error) {
      showSnackbar("Error al anular el movimiento.", "error");
      console.error(`Error al anular el movimiento N° ${entryNumber}:`, error);
    }
  };  
  
  const handleSaveChanges = async () => {
    if (!editedData || !editedData.entryNumber) {
      showSnackbar("No hay datos para guardar.", "error");
      return;
    }
  
    try {
      const payload: Partial<YarnPurchaseEntry> = {
        period: 2024,
        supplierPoCorrelative: editedData.supplierPoCorrelative,
        supplierPoSeries: editedData.supplierPoSeries,
        fecgf: editedData.fecgf,
        purchaseOrderNumber: editedData.purchaseOrderNumber,
        documentNote: editedData.documentNote || "",
        supplierBatch: editedData.supplierBatch,
        detail: editedData.detail.map((detail, index) => ({
          itemNumber: detail.itemNumber || index + 1,
          yarnId: detail.yarnId,
          guideNetWeight: detail.guideNetWeight,
          guideGrossWeight: detail.guideGrossWeight,
          guidePackageCount: detail.guidePackageCount,
          guideConeCount: detail.guideConeCount,
          detailHeavy: detail.detailHeavy,
          isWeighted: detail.isWeighted,
          statusFlag: detail.statusFlag,
        })),
      };
  
      await updateYarnPurchaseEntry(editedData.entryNumber, 2024, payload);
  
      setDetalle(editedData);
      setIsEditDialogOpen(false);
      showSnackbar("Movimiento actualizado correctamente.", "success");
    } catch (error) {
      showSnackbar("Error al guardar los cambios.", "error");
      console.error("Error al guardar los cambios:", error);
    }
  };     

  const handleOpenYarnDialog = async (yarnId: string) => {
    try {
      const data = await fetchYarnbyId(yarnId);
      setSelectedYarn(data);
      setOpenYarnDialog(true);
    } catch (error) {
      console.error("Error fetching yarn data:", error);
    }
  };

  const handleCloseYarnDialog = () => {
    setOpenYarnDialog(false);
    setSelectedYarn(null);
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
              <strong>N° O/C:</strong> {detalle.purchaseOrderNumber}
            </Typography>
            <Typography style={{ color: "black" }}>
              <strong>Guia - Factura:</strong> {detalle.supplierPoCorrelative} - {detalle.supplierPoSeries || "N/A"}
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
      <div className="max-w-full overflow-x-auto mt-5">
        <table className="w-full table-auto border-collapse">
          <thead className="bg-blue-900">
            <tr>
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
                <th key={index} className="px-4 py-4 text-center font-normal text-white">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {detalle.detail.map((item, index) => {
              const porcentajeDiferencia = item.guideGrossWeight !== 0 
                ? ((1 - item.guideNetWeight / item.guideGrossWeight) * 100).toFixed(2)
                : "0.00";

              return (
                <React.Fragment key={index}>
                  <tr className="text-center text-black">
                    <td className="border-b border-gray-300 px-4 py-5">{item.itemNumber}</td>
                    <td className="border-b border-gray-300 px-4 py-5">
                      {item.yarnId}
                      <IconButton onClick={() => handleOpenYarnDialog(item.yarnId)}>
                        <VisibilityIcon style={{ color: "#1976d2" }} />
                      </IconButton>
                    </td>
                    <td className="border-b border-gray-300 px-4 py-5">{item.guidePackageCount}</td>
                    <td className="border-b border-gray-300 px-4 py-5">{item.guideConeCount}</td>
                    <td className="border-b border-gray-300 px-4 py-5">{detalle.mecsaBatch}</td>
                    <td className="border-b border-gray-300 px-4 py-5">{porcentajeDiferencia}%</td>
                    <td className="border-b border-gray-300 px-4 py-5">{item.guideGrossWeight}</td>
                    <td className="border-b border-gray-300 px-4 py-5">{item.guideNetWeight}</td>
                    <td className="border-b border-gray-300 px-4 py-5">
                      <IconButton onClick={() => toggleRow(index)}>
                        {openRows[index] ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={10} style={{ padding: 0 }}>
                      <Collapse in={openRows[index]} timeout="auto" unmountOnExit>
                        <div className="bg-gray-100 p-4 rounded-md shadow-inner">
                          <table className="w-full table-auto border-collapse">
                            <thead>
                              <tr className="bg-gray-200">
                                {["Grupo", "N° Bultos", "N° Conos", "Peso Bruto", "Peso Neto", "Peso Mecsa", "Estado", "Bultos Restantes"].map(
                                  (subCol, subIndex) => (
                                    <th key={subIndex} className="px-4 py-2 text-center font-medium text-gray-700">
                                      {subCol}
                                    </th>
                                  )
                                )}
                              </tr>
                            </thead>
                            <tbody>
                              {item.detailHeavy.map((group, groupIndex) => (
                                <tr key={groupIndex} className="text-center text-gray-800">
                                  <td className="border-b border-gray-300 px-4 py-2">{group.groupNumber}</td>
                                  <td className="border-b border-gray-300 px-4 py-2">{group.packageCount}</td>
                                  <td className="border-b border-gray-300 px-4 py-2">{group.coneCount}</td>
                                  <td className="border-b border-gray-300 px-4 py-2">{group.grossWeight}</td>
                                  <td className="border-b border-gray-300 px-4 py-2">{group.netWeight}</td>
                                  <td className="border-b border-gray-300 px-4 py-2">{item.mecsaWeight}</td>
                                  <td className="border-b border-gray-300 px-4 py-2">
                                    <span className={group.dispatchStatus ? "text-green-600" : "text-red-600"}>
                                      {group.dispatchStatus ? "Despachado" : "No despachado"}
                                    </span>
                                  </td>
                                  <td className="border-b border-gray-300 px-4 py-2">{group.packagesLeft}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </Collapse>
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-between mt-5">
        <Button
          variant="contained"
          style={{ backgroundColor: "#0288d1", color: "#fff" }}
          onClick={() => router.push("/operaciones-new/movimiento-ingreso-hilado")}
        >
          Regresar a Movimientos
        </Button>
        <Button
        variant="contained"
        style={{ backgroundColor: "#0288d1", color: "#fff" }}
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
                                  packagesLeft: 0,
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
      <Dialog
        open={openYarnDialog}
        onClose={handleCloseYarnDialog}
        fullScreen={isSmallScreen}
        maxWidth="md"
        PaperProps={{
          sx: {
            ...(!isSmallScreen && !isMediumScreen && {
              marginLeft: "200px",
              maxWidth: "calc(100% - 280px)",
            }),
            maxHeight: "calc(100% - 64px)",
            overflowY: "auto",
          },
        }}
      >
        <DialogContent>
          <h3 className="text-lg font-semibold text-black mb-4">
            Información del Hilado
          </h3>
          {selectedYarn ? (
            <div className="mb-4 text-black">
              <p className="mb-2"><strong>Descripción:</strong> {selectedYarn.description}</p>
              <p className="mb-2"><strong>Título:</strong> {selectedYarn.yarnCount?.value || "--"}</p>
              <p className="mb-2"><strong>Acabado:</strong> {selectedYarn.spinningMethod?.value || "--"}</p>
              <p className="mb-2"><strong>Barcode:</strong> {selectedYarn.barcode}</p>
              <p className="mb-2"><strong>Color:</strong> {selectedYarn.color?.name || "No teñido"}</p>
              <p className="mb-2"><strong>Fabricado en:</strong> {selectedYarn.manufacturedIn?.value || "--"}</p>
              <p className="mb-2">
                <strong>Distinciones:</strong>{" "}
                {selectedYarn.distinctions && selectedYarn.distinctions.length > 0
                  ? selectedYarn.distinctions.map((dist) => dist.value).join(", ")
                  : "--"
                }
              </p>
            </div>
          ) : (
            <p>Cargando información del hilado...</p>
          )}
          
          <h3 className="text-lg font-semibold text-black mb-2 mt-4">Receta</h3>
          <div className="max-w-full overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-blue-900 uppercase text-center text-white">
                  <th className="px-4 py-4 text-center font-normal">Categoría</th>
                  <th className="px-4 py-4 text-center font-normal">Denominación</th>
                  <th className="px-4 py-4 text-center font-normal">Procedencia</th>
                  <th className="px-4 py-4 text-center font-normal">Color</th>
                  <th className="px-4 py-4 text-center font-normal">Proporción (%)</th>
                </tr>
              </thead>
              <tbody>
                {selectedYarn?.recipe?.length > 0 ? (
                  selectedYarn.recipe.map((item, index) => (
                    <tr key={index} className="text-center text-black">
                      <td className="border-b border-gray-300 px-4 py-5">
                        {item.fiber?.category?.value || "-"}
                      </td>
                      <td className="border-b border-gray-300 px-4 py-5">
                        {item.fiber?.denomination?.value || "-"}
                      </td>
                      <td className="border-b border-gray-300 px-4 py-5">
                        {item.fiber?.origin || "-"}
                      </td>
                      <td className="border-b border-gray-300 px-4 py-5">
                        {item.fiber?.color?.name || "Crudo"}
                      </td>
                      <td className="border-b border-gray-300 px-4 py-5">
                        {item.proportion}%
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-gray-500">
                      No hay datos disponibles.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseYarnDialog}
            variant="contained"
            style={{ backgroundColor: "#d32f2f", color: "#fff" }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{
            width: "100%",
            backgroundColor: snackbarSeverity === "success" ? "#1976d2" : "#d32f2f",
            color: "#fff",
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

    </div>
  );
};

export default DetallesMovIngresoHilado;
