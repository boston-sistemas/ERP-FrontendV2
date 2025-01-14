"use client";

import React, { useState, useEffect } from "react";
import { Button, TextField, MenuItem, Snackbar, Alert } from "@mui/material";
import { useRouter } from "next/navigation";
import { handleFetchFiberCategories, handleFetchCountries, handleFetchColors, handleCreateFiber } from "../../../use-cases/fibra";
import { handleError } from "../../../services/fibraService";

const CrearFibra: React.FC = () => {
  const router = useRouter();
  const [categoria, setCategoria] = useState("");
  const [variedad, setVariedad] = useState("");
  const [procedencia, setProcedencia] = useState("");
  const [color, setColor] = useState("");
  const [categories, setCategories] = useState<{ id: number; value: string }[]>([]);
  const [countries, setCountries] = useState<{ id: string; name: string }[]>([]);
  const [colors, setColors] = useState<{ id: string; name: string }[]>([]);
  const [errors, setErrors] = useState({ categoria: false, variedad: false });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  useEffect(() => {
    const fetchData = async () => {
      try {
        await handleFetchFiberCategories(setCategories);
        await handleFetchCountries(setCountries);
        await handleFetchColors(setColors); 
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const newErrors = {
      categoria: !categoria,
      variedad: !variedad,
    };
    setErrors(newErrors);
  
    if (!Object.values(newErrors).includes(true)) {
      const payload = {
        categoryId: Number(categoria),
        denomination: variedad.toUpperCase(),
        origin: procedencia || null,
        colorId: color || null,
      };
  
      try {
        // Intentar crear la fibra
        await handleCreateFiber(payload);
  
        // Si se crea correctamente, mostrar mensaje de éxito
        setSnackbarMessage("Fibra creada exitosamente");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
  
        // Redirigir después de mostrar el mensaje de éxito
        setTimeout(() => {
          router.push("/operaciones-new/fibras");
        }, 1000);
      } catch (error: any) {
        // Centraliza el manejo del error utilizando handleError
        const errorMessage = handleError(error);
  
        // Mostrar mensaje de error en el Snackbar
        console.error("Error al intentar crear la fibra:", errorMessage);
        setSnackbarMessage(errorMessage); // Mostrar el mensaje procesado
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    }
  };
  
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleVolver = () => {
    router.push("/operaciones-new/fibras");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900" style={{ marginTop: "-10vh" }}>
      <div className="p-8 bg-white dark:bg-gray-800 border border-gray-300 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center text-blue-800 dark:text-blue-400 mb-6">Crear Fibra</h2>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Categoría *"
            fullWidth
            select
            value={categoria}
            onChange={(e) => {
              setCategoria(e.target.value);
              setErrors((prev) => ({ ...prev, categoria: false }));
            }}
            error={errors.categoria}
            helperText={errors.categoria ? "Campo requerido" : ""}
            margin="dense"
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#444444", // Color negro por defecto
                },
                "&:hover fieldset": {
                  borderColor: "#444444", // Color negro al pasar el cursor
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#444444", // Color negro al enfocar
                },
              },
              "& .MuiInputLabel-root": { color: "#444444" },
              "& .MuiInputLabel-root.Mui-focused": { color: "#444444" },
            }}
          >
            <MenuItem value="">Sin categoría</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.value}
              </MenuItem>
            ))}
          </TextField>
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
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "#444444", // Color negro por defecto
              },
              "&:hover fieldset": {
                borderColor: "#444444", // Color negro al pasar el cursor
              },
              "&.Mui-focused fieldset": {
                borderColor: "#444444", // Color negro al enfocar
              },
            },
            "& .MuiInputLabel-root": { color: "#444444" },
            "& .MuiInputLabel-root.Mui-focused": { color: "#444444" },
          }}
        />

        <TextField
          label="Procedencia"
          fullWidth
          select
          value={procedencia}
          onChange={(e) => setProcedencia(e.target.value)}
          margin="dense"
          variant="outlined"
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "#444444", // Color negro por defecto
              },
              "&:hover fieldset": {
                borderColor: "#444444", // Color negro al pasar el cursor
              },
              "&.Mui-focused fieldset": {
                borderColor: "#444444", // Color negro al enfocar
              },
            },
            "& .MuiInputLabel-root": { color: "#444444" },
            "& .MuiInputLabel-root.Mui-focused": { color: "#444444" },
          }}
        >
          <MenuItem value="">Sin procedencia</MenuItem>
          {countries.map((country) => (
            <MenuItem key={country.id} value={country.id}>
              {country.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Color"
          fullWidth
          select
          value={color}
          onChange={(e) => setColor(e.target.value)}
          margin="dense"
          variant="outlined"
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "#444444", // Color negro por defecto
              },
              "&:hover fieldset": {
                borderColor: "#444444", // Color negro al pasar el cursor
              },
              "&.Mui-focused fieldset": {
                borderColor: "#444444", // Color negro al enfocar
              },
            },
            "& .MuiInputLabel-root": { color: "#444444" },
            "& .MuiInputLabel-root.Mui-focused": { color: "#444444" },
          }}
        >
          <MenuItem value="">Sin color</MenuItem>
          {colors.map((color) => (
            <MenuItem key={color.id} value={color.id}>
              {color.name}
            </MenuItem>
          ))}
        </TextField>

          <div className="flex justify-between mt-6">
            <Button variant="contained" style={{ backgroundColor: "#d32f2f", color: "#fff" }} onClick={handleVolver}>
              Volver
            </Button>
            <Button type="submit" variant="contained" style={{ backgroundColor: "#1976d2", color: "#fff" }}>
              Crear
            </Button>
          </div>
        </form>
      </div>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default CrearFibra;
