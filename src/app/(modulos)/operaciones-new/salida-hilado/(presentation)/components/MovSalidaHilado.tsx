"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
} from "@mui/material";

const initialData = [
  {
    item: 1,
    codigo: "H301CM20SI",
    descripcion: "Hilado 30/1 Melange 20% SAN IGNACIO",
    nBultos: "",
    nConos: "",
    pesoBruto: "10,000.00",
    pesoNeto: "8,530.78",
    nIngreso: "1040000758",
    grupo: "G1",
    proveeHilado: "Proveedor A",
  },
];

const MovSalidaHilado: React.FC = () => {
  const [data, setData] = useState(initialData);
  const [proveedor, setProveedor] = useState("");
  const [nota, setNota] = useState("");

  const handleInputChange = (index: number, field: string, value: string) => {
    const newData = [...data];
    newData[index][field] = value;
    setData(newData);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 py-6">
      <div className="w-full max-w-7xl bg-white border border-gray-300 rounded-lg shadow-lg p-6 space-y-6">
        {/* Título */}
        <h2 className="text-xl font-bold text-center text-blue-900">
          Salida de Hilado
        </h2>

        {/* Formulario */}
        <div className="grid grid-cols-2 gap-4">
          <TextField
            label="Proveedor"
            variant="outlined"
            size="small"
            value={proveedor}
            onChange={(e) => setProveedor(e.target.value)}
            fullWidth
          />
          <TextField
            label="Nota"
            variant="outlined"
            size="small"
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            fullWidth
          />
        </div>

        {/* Tabla */}
        <TableContainer className="border border-gray-300 rounded-lg">
          <Table>
            <TableHead>
              <TableRow className="bg-blue-900">
                {[
                  "Item",
                  "Código",
                  "Descripción",
                  "N° Bultos",
                  "N° Conos",
                  "Peso Bruto",
                  "Peso Neto",
                  "N° Ingreso",
                  "Grupo",
                  "Provee. Hilado",
                ].map((col, index) => (
                  <TableCell
                    key={index}
                    className="text-white text-center font-bold"
                  >
                    {col}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="text-center">{row.item}</TableCell>
                  <TableCell className="text-center">{row.codigo}</TableCell>
                  <TableCell className="text-center">{row.descripcion}</TableCell>
                  <TableCell className="text-center">
                    <TextField
                      value={row.nBultos}
                      onChange={(e) =>
                        handleInputChange(index, "nBultos", e.target.value)
                      }
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <TextField
                      value={row.nConos}
                      onChange={(e) =>
                        handleInputChange(index, "nConos", e.target.value)
                      }
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell className="text-center">{row.pesoBruto}</TableCell>
                  <TableCell className="text-center">{row.pesoNeto}</TableCell>
                  <TableCell className="text-center">{row.nIngreso}</TableCell>
                  <TableCell className="text-center">{row.grupo}</TableCell>
                  <TableCell className="text-center">{row.proveeHilado}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Botón */}
        <div className="flex justify-end">
          <Button
            variant="contained"
            style={{ backgroundColor: "#1976d2", color: "#fff" }}
          >
            Guardar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MovSalidaHilado;
