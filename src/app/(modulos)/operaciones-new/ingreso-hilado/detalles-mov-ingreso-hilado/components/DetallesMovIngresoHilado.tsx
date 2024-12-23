"use client";

import React, { useState, useEffect } from "react";
import {
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  CircularProgress,
} from "@mui/material";
import { Edit } from "@mui/icons-material";
import { useParams } from "next/navigation"; // Para capturar parámetros dinámicos
import instance from "@/infrastructure/config/AxiosConfig";
import { YarnPurchaseEntry } from "../../../models/models";

const DetallesMovIngresoHilado: React.FC = () => {
  const { entryNumber } = useParams<{ entryNumber: string }>(); // Captura el parámetro de la URL
  const [detalle, setDetalle] = useState<YarnPurchaseEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchYarnPurchaseEntryDetails = async (
    entryNumber: string,
    period: number
  ): Promise<YarnPurchaseEntry> => {
    try {
      const response = await instance.get<YarnPurchaseEntry>(
        `/operations/v1/yarn-purchase-entries/${entryNumber}?period=${period}`
      );
      return response.data;
    } catch (error) {
      throw new Error("Error al obtener los detalles del ingreso de hilado.");
    }
  };

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const response = await fetchYarnPurchaseEntryDetails(entryNumber!, 2024);
        setDetalle(response);
        setLoading(false);
      } catch (err) {
        console.error("Error al cargar los detalles:", err);
        setError("No se pudieron cargar los detalles del ingreso.");
        setLoading(false);
      }
    };

    if (entryNumber) {
      fetchDetails();
    }
  }, [entryNumber]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <CircularProgress />
      </div>
    );
  }

  if (error || !detalle) {
    return (
      <Typography color="error" className="text-center mt-4">
        {error || "Error desconocido al cargar los detalles."}
      </Typography>
    );
  }

  return (
    <div className="space-y-5">
      {/* Cabecera */}
      <div className="rounded-sm border border-stroke bg-white px-5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
        <Typography variant="h6" className="text-black font-bold mb-4">
          DETALLES DE INGRESO DE HILADO
        </Typography>
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <Typography>
              <strong>N°:</strong> {detalle.entryNumber}
            </Typography>
            <Typography>
              <strong>PROVEEDOR:</strong> {detalle.supplierCode}
            </Typography>
            <Typography>
              <strong>O/C N°:</strong> {detalle.purchaseOrderNumber}
            </Typography>
            <Typography>
              <strong>Lote Proveedor:</strong> {detalle.supplierBatch}
            </Typography>
          </div>
          <div>
            <Typography>
              <strong>FECHA DOC.:</strong> {detalle.fecgf}
            </Typography>
            <Typography>
              <strong>TIPO DE CAMBIO:</strong> {detalle.exchangeRate}
            </Typography>
            <Typography>
              <strong>MONEDA:</strong> {detalle.currencyCode}
            </Typography>
            <Typography>
              <strong>Lote Mecsa:</strong> {detalle.mecsaBatch}
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
                "Peso Bruto Guía",
                "Peso Neto Guía",
                "N° Bultos",
                "N° Conos",
                "Estado",
              ].map((col, index) => (
                <TableCell
                  key={index}
                  className="px-4 py-4 text-center font-normal text-white"
                >
                  {col}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {detalle.detail.map((item, index) => (
              <TableRow key={index} className="text-center">
                <TableCell>{item.itemNumber}</TableCell>
                <TableCell>{item.yarnId}</TableCell>
                <TableCell>{item.guideGrossWeight}</TableCell>
                <TableCell>{item.guideNetWeight}</TableCell>
                <TableCell>{item.guidePackageCount}</TableCell>
                <TableCell>{item.guideConeCount}</TableCell>
                <TableCell>{item.statusFlag}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default DetallesMovIngresoHilado;
