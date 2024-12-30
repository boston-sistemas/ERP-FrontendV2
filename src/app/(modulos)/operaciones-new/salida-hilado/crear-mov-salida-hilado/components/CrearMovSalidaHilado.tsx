"use client";

import React, { useEffect, useState } from "react";
import { useSalidaHilado } from "../../context/SalidaHiladoContext";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Checkbox,
} from "@mui/material";

const CrearMovSalidaHilado: React.FC = () => {
  const { data } = useSalidaHilado();
  const [selectedGroups, setSelectedGroups] = useState<any[]>([]);

  useEffect(() => {
    if (data) {
      setSelectedGroups(data.groups || []);
    }
  }, [data]);

  const toggleGroupSelection = (group: any) => {
    setSelectedGroups((prev) =>
      prev.find((g) => g.groupNumber === group.groupNumber)
        ? prev.filter((g) => g.groupNumber !== group.groupNumber)
        : [...prev, group]
    );
  };

  const handleSaveSalida = async () => {
    if (selectedGroups.length === 0) {
      alert("Debe seleccionar al menos un grupo para generar la salida.");
      return;
    }

    const payload = {
      entryNumber: data?.entryNumber,
      detail: selectedGroups.map((group) => ({
        entryGroupNumber: group.groupNumber,
        coneCount: group.coneCount,
        packageCount: group.packageCount,
        grossWeight: group.grossWeight,
        netWeight: group.netWeight,
      })),
    };

    console.log("Guardando movimiento de salida:", payload);
    // Implementa la llamada al servicio aquí
  };

  if (!data) {
    return <p>No hay datos para generar el movimiento de salida.</p>;
  }

  return (
    <div>
      <h1>Crear Movimiento de Salida</h1>
      <p>Movimiento de Ingreso Asociado: {data.entryNumber}</p>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Seleccionar</TableCell>
            <TableCell>Grupo</TableCell>
            <TableCell>Peso Neto</TableCell>
            <TableCell>Peso Bruto</TableCell>
            <TableCell>N° Conos</TableCell>
            <TableCell>N° Paquetes</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.groups.map((group, index) => (
            <TableRow key={index}>
              <TableCell>
                <Checkbox
                  checked={selectedGroups.some(
                    (g) => g.groupNumber === group.groupNumber
                  )}
                  onChange={() => toggleGroupSelection(group)}
                />
              </TableCell>
              <TableCell>{group.groupNumber}</TableCell>
              <TableCell>{group.netWeight}</TableCell>
              <TableCell>{group.grossWeight}</TableCell>
              <TableCell>{group.coneCount}</TableCell>
              <TableCell>{group.packageCount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Button
        variant="contained"
        color="primary"
        onClick={handleSaveSalida}
        style={{ marginTop: "16px" }}
      >
        Guardar Salida
      </Button>
    </div>
  );
};

export default CrearMovSalidaHilado;
