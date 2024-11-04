"use client";

import React, { useState } from "react";
import { Button, TextField, MenuItem } from "@mui/material";

const CrearFibra: React.FC = () => {
  const [categoria, setCategoria] = useState("");
  const [variedad, setVariedad] = useState("");
  const [procedencia, setProcedencia] = useState("");
  const [color, setColor] = useState("");
  const [errors, setErrors] = useState({ categoria: false, variedad: false });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = {
      categoria: !categoria,
      variedad: !variedad,
    };
    setErrors(newErrors);

    if (!Object.values(newErrors).includes(true)) {
      console.log("Nueva Fibra Creada:", {
        categoria,
        variedad,
        procedencia,
        color,
      });
      // Limpiar formulario después de crear
      setCategoria("");
      setVariedad("");
      setProcedencia("");
      setColor("");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900" style={{ marginTop: '-10vh' }}>
      <div className="p-8 bg-white dark:bg-gray-800 border border-gray-300 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center text-blue-800 dark:text-blue-400 mb-6">Crear Fibra</h2>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Categoría *"
            fullWidth
            value={categoria}
            onChange={(e) => {
              setCategoria(e.target.value);
              setErrors((prev) => ({ ...prev, categoria: false }));
            }}
            error={errors.categoria}
            helperText={errors.categoria ? "Campo requerido" : ""}
            margin="dense"
            variant="outlined"
            InputLabelProps={{ style: { color: 'black' } }}
            InputProps={{ style: { color: 'black' } }}
          />
          <TextField
            label="Variedad/Marca *"
            fullWidth
            value={variedad}
            onChange={(e) => {
              setVariedad(e.target.value);
              setErrors((prev) => ({ ...prev, variedad: false }));
            }}
            error={errors.variedad}
            helperText={errors.variedad ? "Campo requerido" : ""}
            margin="dense"
            variant="outlined"
            InputLabelProps={{ style: { color: 'black' } }}
            InputProps={{ style: { color: 'black' } }}
          />
          <TextField
            label="Procedencia"
            fullWidth
            select
            value={procedencia}
            onChange={(e) => setProcedencia(e.target.value)}
            margin="dense"
            variant="outlined"
            InputLabelProps={{ style: { color: 'black' } }}
            InputProps={{ style: { color: 'black' } }}
          >
            <MenuItem value="-">-</MenuItem>
            <MenuItem value="PER">Perú</MenuItem>
            <MenuItem value="USA">USA</MenuItem>
          </TextField>
          <TextField
            label="Color"
            fullWidth
            value={color}
            onChange={(e) => setColor(e.target.value)}
            margin="dense"
            variant="outlined"
            InputLabelProps={{ style: { color: 'black' } }}
            InputProps={{ style: { color: 'black' } }}
          />
          <div className="flex justify-end mt-6">
            <Button type="submit" variant="contained" style={{ backgroundColor: "#1976d2", color: "#fff" }}>
              Crear
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearFibra;
