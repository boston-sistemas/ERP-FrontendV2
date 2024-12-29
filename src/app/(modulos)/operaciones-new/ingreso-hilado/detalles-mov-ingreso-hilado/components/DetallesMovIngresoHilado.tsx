"use client";

import React, { useState } from "react";
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

const hardcodedData = {
  entryNumber: "0060026060",
  period: 2024,
  creationDate: "2024-12-13",
  creationTime: "15:05:50",
  supplierCode: "p02517",
  statusFlag: "P",
  purchaseOrderNumber: "0012400235",
  flgtras: true,
  supplierBatch: "CC5-CF240100N",
  mecsaBatch: "0000479",
  documentNote: "",
  currencyCode: 2,
  exchangeRate: 3.722,
  supplierPoCorrelative: "12022",
  supplierPoSeries: "008",
  fecgf: "2024-12-13",
  voucherNumber: "12-061-120031",
  fchcp: "2024-12-12",
  flgcbd: "S",
  serialNumberPo: "006",
  printedFlag: "S",
  detail: [
    {
      itemNumber: 1,
      yarnId: "H301PCOITC",
      mecsaWeight: 2250.0,
      statusFlag: "P",
      isWeighted: true,
      guideGrossWeight: 2366.25,
      detailHeavy: [
        {
          groupNumber: 1,
          statusFlag: "C",
          coneCount: 900,
          packageCount: 75,
          destinationStorage: "006",
          netWeight: 2250.0,
          grossWeight: 2366.25,
          exitNumber: "T1040001438",
          dispatchStatus: true,
          packagesLeft: 0,
          conesLeft: 0,
        },
      ],
      guideNetWeight: 2250.0,
      guideConeCount: 900,
      guidePackageCount: 75,
    },
  ],
};

const DetallesMovIngresoHilado: React.FC = () => {
  const [detalle] = useState(hardcodedData);
  const [openRows, setOpenRows] = useState<Record<number, boolean>>({});

  const toggleRow = (index: number) => {
    setOpenRows((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

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
                //"Descripción",
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
                          <TableRow>
                            <TableCell className="text-center">1</TableCell>
                            <TableCell className="text-center">{item.guideGrossWeight}</TableCell>
                            <TableCell className="text-center" style={{ color: "red" }}>
                              No Despachado
                            </TableCell>
                            <TableCell className="text-center">{item.guidePackageCount}</TableCell>
                          </TableRow>
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
