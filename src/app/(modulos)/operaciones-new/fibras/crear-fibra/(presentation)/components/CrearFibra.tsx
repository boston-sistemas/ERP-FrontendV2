"use client";

import React, { useState, useEffect } from "react";
import { 
  Button, 
  TextField, 
  MenuItem, 
  Snackbar, 
  Alert, 
  Switch, 
  FormControlLabel,
  Autocomplete
} from "@mui/material";
import { useRouter } from "next/navigation";

// Importa tus helpers/servicios:
import { 
  handleFetchFiberCategories, 
  handleFetchCountries, 
  handleFetchColors, 
  handleCreateFiber,
  handleFetchDenominationFibers
} from "../../../use-cases/fibra";
import { handleError } from "../../../services/fibraService";

// Tipado mínimo para el select
type FiberCategory = { id: number; value: string };
type FiberCountry = { id: string; name: string };
type FiberColor = { id: string; name: string };
type FiberDenomination = { id: number; value: string };

const CrearFibra: React.FC = () => {
  const router = useRouter();

  // Estados para los selects
  const [categories, setCategories] = useState<FiberCategory[]>([]);
  const [countries, setCountries] = useState<FiberCountry[]>([]);
  const [colors, setColors] = useState<FiberColor[]>([]);
  const [denominations, setDenominations] = useState<FiberDenomination[]>([]);

  // Estados para los valores seleccionados
  const [categoria, setCategoria] = useState("");
  const [variedad, setVariedad] = useState("");
  const [procedencia, setProcedencia] = useState("");
  const [color, setColor] = useState("");

  // Para control de errores (campos requeridos)
  const [errors, setErrors] = useState({ categoria: false, variedad: false });

  // Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

  const [isColorEnabled, setIsColorEnabled] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Categorías
        await handleFetchFiberCategories(setCategories);
        // Países
        await handleFetchCountries(setCountries);
        // Colores
        await handleFetchColors(setColors);
        // Denominaciones
        await handleFetchDenominationFibers(setDenominations);
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };
    fetchData();
  }, []);

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
  
    // Validación básica

    // Validación básica
    const newErrors = {
      categoria: !categoria,
    };
    setErrors(newErrors);
  
  
    // Si no hay errores, armamos el payload y creamos la fibra

    // Si no hay errores, armamos el payload y creamos la fibra
    if (!Object.values(newErrors).includes(true)) {
      const payload = {
        categoryId: categoria,
        // Asumimos que 'variedad' ahora contiene la cadena
        denominationId: variedad || null,
        origin: procedencia || null,
        colorId: isColorEnabled ? color || null : null, // Verifica si el campo Color está activo
      };

      try {
        // Crear la fibra
        await handleCreateFiber(payload);

        // Mostrar éxito
        setSnackbarMessage("Fibra creada exitosamente");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
  
  
        // Redirigir tras breve pausa

        // Redirigir tras breve pausa
        setTimeout(() => {
          router.push("/operaciones-new/fibras");
        }, 1000);
      } catch (error: any) {
        // Manejo de error unificado
        const errorMessage = handleError(error);
        console.error("Error al intentar crear la fibra:", errorMessage);

        setSnackbarMessage(errorMessage);
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
    <div className="flex justify-center items-start min-h-screen bg-gray-100 dark:bg-gray-900 py-10">
      <div
        className="bg-white dark:bg-gray-800 border border-gray-300 rounded-lg shadow-lg p-6 w-full"
        style={{ maxWidth: "90%", margin: "auto" }}
      >
        <h2 className="text-2xl font-semibold text-center text-blue-800 dark:text-blue-400 mb-6">
          Crear Fibra
        </h2>

        <form onSubmit={handleSubmit}>
          {/* CATEGORÍA */}
          <Autocomplete
            options={categories}
            getOptionLabel={(option) => option.value}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Categoría *"
                margin="dense"
                variant="outlined"
                error={errors.categoria}
                helperText={errors.categoria ? "Campo requerido" : ""}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#444444" },
                    "&:hover fieldset": { borderColor: "#444444" },
                    "&.Mui-focused fieldset": { borderColor: "#444444" },
                  },
                  "& .MuiInputLabel-root": { color: "#444444" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#444444" },
                }}
              />
            )}
            onChange={(event, newValue) => {
              setCategoria(newValue ? newValue.id : "");
              setErrors((prev) => ({ ...prev, categoria: false }));
            }}
          />

          {/* VARIEDAD / DENOMINACIÓN */}
          <Autocomplete
            options={denominations}
            getOptionLabel={(option) => option.value}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Variedad/Marca"
                margin="dense"
                variant="outlined"
                error={errors.variedad}
                helperText={errors.variedad ? "Campo requerido" : ""}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#444444" },
                    "&:hover fieldset": { borderColor: "#444444" },
                    "&.Mui-focused fieldset": { borderColor: "#444444" },
                  },
                  "& .MuiInputLabel-root": { color: "#444444" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#444444" },
                }}
              />
            )}
            onChange={(event, newValue) => {
              setVariedad(newValue ? newValue.id : "");
              setErrors((prev) => ({ ...prev, variedad: false }));
            }}
          />

          {/* PROCEDENCIA */}
          <Autocomplete
            options={countries}
            getOptionLabel={(option) => option.name}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Procedencia"
                margin="dense"
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#444444" },
                    "&:hover fieldset": { borderColor: "#444444" },
                    "&.Mui-focused fieldset": { borderColor: "#444444" },
                  },
                  "& .MuiInputLabel-root": { color: "#444444" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#444444" },
                }}
              />
            )}
            onChange={(event, newValue) => {
              setProcedencia(newValue ? newValue.id : "");
            }}
          />

          {/* TOGGLE PARA ACTIVAR/DESACTIVAR COLOR */}
          <FormControlLabel
            label="¿Fibra con color?"
            labelPlacement="start"
            control={
              <Switch
                checked={isColorEnabled}
                onChange={() => setIsColorEnabled(!isColorEnabled)}
                color="primary"
              />
            }
            sx={{ color: "black" }}
          />

          {/* COLOR */}
          {isColorEnabled && (
            <Autocomplete
              options={colors}
              getOptionLabel={(option) => option.name}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Color"
                  margin="dense"
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "#444444" },
                      "&:hover fieldset": { borderColor: "#444444" },
                      "&.Mui-focused fieldset": { borderColor: "#444444" },
                    },
                    "& .MuiInputLabel-root": { color: "#444444" },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#444444" },
                  }}
                />
              )}
              onChange={(event, newValue) => {
                setColor(newValue ? newValue.id : "");
              }}
            />
          )}

          {/* BOTONES */}
          <div className="flex justify-between mt-6">
            <Button
              variant="contained"
              style={{ backgroundColor: "#d32f2f", color: "#fff" }}
              onClick={handleVolver}
            >
              Volver
            </Button>
            <Button
              type="submit"
              variant="contained"
              style={{ backgroundColor: "#1976d2", color: "#fff" }}
            >
              Crear
            </Button>
          </div>
        </form>
      </div>

      {/* Snackbar de notificaciones */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default CrearFibra;
