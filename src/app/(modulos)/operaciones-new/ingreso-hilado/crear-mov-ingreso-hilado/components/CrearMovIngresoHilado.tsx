"use client";

import React, { useState } from "react";
import {
  Button,
  TextField,
  IconButton,
  Switch,
  Typography,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { useRouter } from "next/navigation";

const CrearMovIngresoHilado: React.FC = () => {
  const router = useRouter();
  const [guiaFactura, setGuiaFactura] = useState("");
  const [fechaGF, setFechaGF] = useState("");
  const [numBultos, setNumBultos] = useState("");
  const [numConos, setNumConos] = useState("");
  const [pesoGuia, setPesoGuia] = useState("");
  const [loteProveedor, setLoteProveedor] = useState("");
  const [nota, setNota] = useState("");
  const [pesaje, setPesaje] = useState(false);

  const handleCreate = () => {
    console.log("Movimiento creado con los siguientes datos:", {
      guiaFactura,
      fechaGF,
      numBultos,
      numConos,
      pesoGuia,
      loteProveedor,
      pesaje,
      nota,
    });
    // Lógica adicional para enviar los datos al backend.
    router.push("/operaciones-new/ingreso-hilado");
  };

  const handleCancel = () => {
    router.push("/operaciones-new/ingreso-hilado");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border border-gray-300 rounded-lg shadow-lg p-8 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-6 text-center">Crear Mov. de Ingreso de Hilado</h2>
        <div className="mb-4">
          <Typography variant="subtitle1" className="font-semibold mb-2">
            Seleccionar Orden de Compra
          </Typography>
          <IconButton>
            <Add />
          </IconButton>
        </div>
        <form>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <TextField
              label="Guía/Factura"
              value={guiaFactura}
              onChange={(e) => setGuiaFactura(e.target.value)}
              fullWidth
              variant="outlined"
              size="small"
            />
            <TextField
              label="Fecha G/F"
              type="date"
              value={fechaGF}
              onChange={(e) => setFechaGF(e.target.value)}
              fullWidth
              variant="outlined"
              size="small"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="N° Bultos"
              value={numBultos}
              onChange={(e) => setNumBultos(e.target.value)}
              fullWidth
              variant="outlined"
              size="small"
            />
            <TextField
              label="N° Conos"
              value={numConos}
              onChange={(e) => setNumConos(e.target.value)}
              fullWidth
              variant="outlined"
              size="small"
            />
            <TextField
              label="Peso Guía"
              value={pesoGuia}
              onChange={(e) => setPesoGuia(e.target.value)}
              fullWidth
              variant="outlined"
              size="small"
            />
            <TextField
              label="Lte. Provee."
              value={loteProveedor}
              onChange={(e) => setLoteProveedor(e.target.value)}
              fullWidth
              variant="outlined"
              size="small"
            />
          </div>
          <div className="flex items-center justify-between mb-4">
            <Typography variant="subtitle1" className="font-semibold">
              Pesaje
            </Typography>
            <Switch
              checked={pesaje}
              onChange={(e) => setPesaje(e.target.checked)}
              color="primary"
            />
          </div>
          <TextField
            label="Nota"
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            size="small"
            className="mb-6"
          />
          <div className="flex justify-between">
            <Button
              variant="contained"
              style={{ backgroundColor: "#d32f2f", color: "#fff" }}
              onClick={handleCancel}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              style={{ backgroundColor: "#1976d2", color: "#fff" }}
              onClick={handleCreate}
            >
              Crear
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearMovIngresoHilado;
