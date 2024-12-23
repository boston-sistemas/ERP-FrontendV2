"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CircularProgress, Typography, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";

const DetallesMovIngresoHilado: React.FC = () => {
  const { entryNumber } = useParams(); // Captura el parámetro dinámico de la URL
  const [detalle, setDetalle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetalle = async () => {
      try {
        // Aquí iría el servicio para obtener los detalles usando `entryNumber`
        // Simulación de datos
        const simulatedData = {
          numero: entryNumber,
          proveedor: "Proveedor Ejemplo",
          ordenCompra: "OC12345",
          guiaFactura: "GF67890",
          loteProveedor: "LP98765",
          items: [
            { item: 1, codigo: "H001", descripcion: "Hilo algodón", pesoBruto: "10 kg", pesoNeto: "9 kg" },
            { item: 2, codigo: "H002", descripcion: "Hilo poliéster", pesoBruto: "12 kg", pesoNeto: "11 kg" },
          ],
        };

        setDetalle(simulatedData);
      } catch (error) {
        console.error("Error al cargar los detalles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetalle();
  }, [entryNumber]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <CircularProgress />
      </div>
    );
  }

  if (!detalle) {
    return <Typography>No se encontraron detalles para el ingreso N° {entryNumber}</Typography>;
  }

  return (
    <div className="space-y-5">
      <Typography variant="h6" className="text-black font-bold mb-4">
        Detalles del Ingreso N° {detalle.numero}
      </Typography>
      <div>
        <Typography><strong>Proveedor:</strong> {detalle.proveedor}</Typography>
        <Typography><strong>Orden de Compra:</strong> {detalle.ordenCompra}</Typography>
        <Typography><strong>Guía/Factura:</strong> {detalle.guiaFactura}</Typography>
        <Typography><strong>Lote Proveedor:</strong> {detalle.loteProveedor}</Typography>
      </div>
      <Table>
        <TableHead>
          <TableRow>
            {["Item", "Código", "Descripción", "Peso Bruto", "Peso Neto"].map((col) => (
              <TableCell key={col}>{col}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {detalle.items.map((item: any) => (
            <TableRow key={item.item}>
              <TableCell>{item.item}</TableCell>
              <TableCell>{item.codigo}</TableCell>
              <TableCell>{item.descripcion}</TableCell>
              <TableCell>{item.pesoBruto}</TableCell>
              <TableCell>{item.pesoNeto}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DetallesMovIngresoHilado;
