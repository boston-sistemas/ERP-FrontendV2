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
} from "@mui/material";
import { Edit, ExpandMore, ExpandLess } from "@mui/icons-material";
import { useRouter, useParams } from "next/navigation";
import { fetchYarnPurchaseEntryDetails } from "../../services/movIngresoHiladoService";
import { YarnPurchaseEntry } from "../../../models/models";

const DetallesMovIngresoHilado: React.FC = () => {
  const router = useRouter();
  const { entryNumber } = useParams() as { entryNumber: string };
  const [detalle, setDetalle] = useState<YarnPurchaseEntry | null>(null);
  const [openRows, setOpenRows] = useState<Record<number, boolean>>({});

  // Cargar datos del movimiento
  useEffect(() => {
    const loadDetails = async () => {
      try {
        if (entryNumber) {
          const period = new Date().getFullYear(); // Aquí puedes ajustar si el período debe venir de otro lado
          const data = await fetchYarnPurchaseEntryDetails(entryNumber, period);
          setDetalle(data);
        }
      } catch (error) {
        console.error("Error al cargar los detalles del movimiento:", error);
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

  if (!detalle) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Typography variant="h6">Cargando detalles del movimiento...</Typography>
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
              <strong>Guía/Factura:</strong> {detalle.documentNote || "N/A"}
            </Typography>
            <Typography style={{ color: "black" }}>
              <strong>Lote Proveedor:</strong> {detalle.supplierBatch}
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
          </div>
        </div>
        <Button
          startIcon={<Edit />}
          variant="contained"
          style={{ backgroundColor: "#0288d1", color: "#fff" }}
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

      {/* Botón de acción */}
      <div className="flex justify-end mt-5">
        <Button
          variant="contained"
          style={{ backgroundColor: "#4caf50", color: "#fff" }}
          size="large"
        >
          Generar Salida
        </Button>
      </div>
    </div>
  );
};

export default DetallesMovIngresoHilado;
