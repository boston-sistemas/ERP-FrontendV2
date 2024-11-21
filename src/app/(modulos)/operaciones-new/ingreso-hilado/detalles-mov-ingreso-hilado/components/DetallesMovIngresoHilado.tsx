"use client";

import React, { useState } from "react";
import {
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Collapse,
  Checkbox,
} from "@mui/material";
import { Visibility, Edit, KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";

const DetallesMovIngresoHilado: React.FC = () => {
  const [openDetails, setOpenDetails] = useState(false); 

  const detalleCabecera = {
    numero: "60024521",
    proveedor: "P0249 GRUPO INDUSTRIAL SAN IGNACIO SA",
    ordenCompra: "12400143",
    guiaFactura: "07 296",
    loteProveedor: "GSI-P122",
    fechaDoc: "12/09/2024",
    tipoCambio: "3.7850",
    moneda: "US$",
    fechaGF: "12/09/2024",
  };

  const detalleItems = [
    {
      item: 1,
      codigo: "H301PCOISI",
      descripcion: "Hilo Algodón",
      numBultos: 47,
      numConos: 705,
      loteMecsa: "0001125",
      porcentajeDiferencia: "0.00%",
      pesoBruto: "1,372.00",
      pesoNeto: "1.000",
    },
  ];

  const detallePesos = [
    {
      item: 1,
      grupo: 1,
      pesoGuia: "26,332.460",
      numBultos: 47,
      numConos: 705,
      pesoBruto: "1,372.00",
      pesoNeto: "1.000",
      bultosRestantes: 47,
      estado: "No Despachado",
    },
  ];

  return (
    <div className="space-y-5">
      <div className="rounded-sm border border-stroke bg-white px-5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
        {/* Cabecera */}
        <Typography variant="h6" className="text-black font-bold mb-4">
          DETALLES DE INGRESO DE HILADO
        </Typography>
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <Typography>
              <strong>N°:</strong> {detalleCabecera.numero}
            </Typography>
            <Typography>
              <strong>PROVEEDOR:</strong> {detalleCabecera.proveedor}
            </Typography>
            <Typography>
              <strong>O/C N°:</strong> {detalleCabecera.ordenCompra}
            </Typography>
            <Typography>
              <strong>GUÍA/FACTURA:</strong> {detalleCabecera.guiaFactura}
            </Typography>
            <Typography>
              <strong>Lte. Provee.:</strong> {detalleCabecera.loteProveedor}
            </Typography>
          </div>
          <div>
            <Typography>
              <strong>FECHA DOC.:</strong> {detalleCabecera.fechaDoc}
            </Typography>
            <Typography>
              <strong>TIPO DE CAMBIO:</strong> {detalleCabecera.tipoCambio}
            </Typography>
            <Typography>
              <strong>MONEDA:</strong> {detalleCabecera.moneda}
            </Typography>
            <Typography>
              <strong>FECHA G/F:</strong> {detalleCabecera.fechaGF}
            </Typography>
          </div>
        </div>

        {/* Botón Editar */}
        <div className="flex justify-end">
          <Button
            startIcon={<Edit />}
            variant="contained"
            style={{ backgroundColor: "#0288d1", color: "#fff" }}
          >
            Editar
          </Button>
        </div>
      </div>

      {/* Tabla de Detalle */}
      <TableContainer className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <Table>
          <TableHead className="bg-blue-900">
            <TableRow>
              {[
                "Item",
                "Código",
                "Descripción",
                "N° Bultos",
                "N° Conos",
                "Lte. Mecsa",
                "%Dif.",
                "Peso Bruto",
                "Peso Neto",
                "Pesaje",
              ].map((col, index) => (
                <TableCell
                  key={index}
                  className="px-4 py-2 text-center text-white"
                >
                  {col}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {detalleItems.map((item, index) => (
              <TableRow key={index} className="text-center">
                <TableCell className="text-center">{item.item}</TableCell>
                <TableCell className="text-center">{item.codigo}</TableCell>
                <TableCell className="text-center">
                  <IconButton>
                    <Visibility />
                  </IconButton>
                </TableCell>
                <TableCell className="text-center">{item.numBultos}</TableCell>
                <TableCell className="text-center">{item.numConos}</TableCell>
                <TableCell className="text-center">{item.loteMecsa}</TableCell>
                <TableCell className="text-center">{item.porcentajeDiferencia}</TableCell>
                <TableCell className="text-center">{item.pesoBruto}</TableCell>
                <TableCell className="text-center">{item.pesoNeto}</TableCell>
                <TableCell className="text-center">
                  <IconButton onClick={() => setOpenDetails(!openDetails)}>
                    {openDetails ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Tabla de Pesos (Detalles) */}
      <Collapse in={openDetails} timeout="auto" unmountOnExit>
        <TableContainer className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <Table>
            <TableHead className="bg-blue-900">
              <TableRow>
                {[
                  "Item",
                  "Grupo",
                  "Peso Guía",
                  "N° Bultos",
                  "N° Conos",
                  "Peso Bruto",
                  "Peso Neto",
                  "Bultos Restantes",
                  "Estado",
                  "Salida",
                ].map((col, index) => (
                  <TableCell
                    key={index}
                    className="px-4 py-2 text-center text-white"
                  >
                    {col}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {detallePesos.map((peso, index) => (
                <TableRow key={index} className="text-center">
                  <TableCell className="text-center">{peso.item}</TableCell>
                  <TableCell className="text-center">{peso.grupo}</TableCell>
                  <TableCell className="text-center">{peso.pesoGuia}</TableCell>
                  <TableCell className="text-center">{peso.numBultos}</TableCell>
                  <TableCell className="text-center">{peso.numConos}</TableCell>
                  <TableCell className="text-center">{peso.pesoBruto}</TableCell>
                  <TableCell className="text-center">{peso.pesoNeto}</TableCell>
                  <TableCell className="text-center">{peso.bultosRestantes}</TableCell>
                  <TableCell className="text-center text-red-500 font-bold">
                    {peso.estado}
                  </TableCell>
                  <TableCell>
                    <Checkbox />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Collapse>

      {/* Botón Generar Salida */}
      <div className="flex justify-end">
        <Button
          variant="contained"
          style={{ backgroundColor: "#1976d2", color: "#fff" }}
          className="mt-6"
        >
          Generar Salida
        </Button>
      </div>
    </div>
  );
};

export default DetallesMovIngresoHilado;
