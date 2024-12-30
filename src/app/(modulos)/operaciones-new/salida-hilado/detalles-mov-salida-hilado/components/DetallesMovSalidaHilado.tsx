"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchYarnDispatchByNumber } from "../../services/movSalidaHiladoService";
import { YarnDispatch } from "../../../models/models";
import { CircularProgress, Typography, Box } from "@mui/material";

const DetallesMovSalidaHilado: React.FC = () => {
  const { exitNumber } = useParams(); 
  const [dispatchDetail, setDispatchDetail] = useState<YarnDispatch | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!exitNumber || Array.isArray(exitNumber)) {
        setError("No se proporcionó un número de salida válido.");
        return;
      }
  
      setIsLoading(true);
      try {
        const data = await fetchYarnDispatchByNumber(exitNumber, 2024); 
        setDispatchDetail(data);
      } catch (err) {
        setError("Error al obtener el detalle del movimiento.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchData();
  }, [exitNumber]);  

  if (isLoading) {
    return (
      <Box className="flex justify-center items-center h-full">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (!dispatchDetail) {
    return <Typography>No se encontró el detalle del movimiento.</Typography>;
  }

  return (
    <Box className="p-4">
      <Typography variant="h5" gutterBottom>
        Detalle del Movimiento de Salida
      </Typography>
      <Typography><strong>Número de Salida:</strong> {dispatchDetail.exitNumber}</Typography>
      <Typography><strong>Fecha de Creación:</strong> {dispatchDetail.creationDate}</Typography>
      <Typography><strong>Proveedor:</strong> {dispatchDetail.supplierCode}</Typography>
      <Typography><strong>Nota del Documento:</strong> {dispatchDetail.documentNote || "No existe Nota de documento"}</Typography>
      <Typography variant="h6" gutterBottom>
        Detalle de Ítems
      </Typography>
      <ul>
        {dispatchDetail.detail.map((item, index) => (
          <li key={index} className="mb-2">
            <Typography><strong>Ítem Número:</strong> {item.itemNumber}</Typography>
            <Typography><strong>Peso Neto:</strong> {item.netWeight}</Typography>
            <Typography><strong>Peso Bruto:</strong> {item.grossWeight}</Typography>
            <Typography><strong>Conos:</strong> {item.coneCount}</Typography>
            <Typography><strong>Paquetes:</strong> {item.packageCount}</Typography>
          </li>
        ))}
      </ul>
    </Box>
  );
};

export default DetallesMovSalidaHilado;
