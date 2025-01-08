"use client";

import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import { Add, Close } from "@mui/icons-material";
import { useRouter } from "next/navigation";

import {
  createFabric,
  fetchFabricTypes,
  fetchMecsaColors,
  fetchHilados,
  FabricType,
} from "../../services/tejidosService";

import { MecsaColor } from "../../../models/models";

// Estructura minimal para un ítem de la receta
interface RecipeItem {
  yarnId: string;      // ID del hilado
  proportion: number;  // Proporción
  numPlies: number;    // # de cabos
  gauge: number;       // Galga
  diameter: number;    // Diámetro
  stitchLength: number; // Stitch length
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const CrearTejido: React.FC = () => {
  const router = useRouter();

  // State para selects
  const [fabricTypes, setFabricTypes] = useState<FabricType[]>([]);
  const [colors, setColors] = useState<MecsaColor[]>([]);

  // Campos del Tejido
  const [fabricTypeId, setFabricTypeId] = useState<number>(0); // se llenará con un <Select>
  const [density, setDensity] = useState<number>(100);
  const [width, setWidth] = useState<number>(80);
  const [colorId, setColorId] = useState<string>(""); // se llenará con un <Select>
  const [structurePattern, setStructurePattern] = useState<string>("LISO");
  const [description, setDescription] = useState<string>("");

  // Receta
  const [recipe, setRecipe] = useState<RecipeItem[]>([]);

  // Yarn/hilados
  const [hilados, setHilados] = useState<any[]>([]);
  const [hiladosDialogOpen, setHiladosDialogOpen] = useState(false);
  const [paginaH, setPaginaH] = useState(0);
  const [filasPorPaginaH, setFilasPorPaginaH] = useState(5);

  // Snackbar
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");

  // Cargar combos (fabricTypes, colors) al montar
  useEffect(() => {
    const loadCombos = async () => {
      try {
        const [typesResp, colorsResp] = await Promise.all([
          fetchFabricTypes(),
          fetchMecsaColors(),
        ]);
        setFabricTypes(typesResp.fabricTypes || []);
        setColors(colorsResp.mecsaColors || []);
      } catch (err) {
        console.error("Error al cargar combos:", err);
      }
    };
    loadCombos();
  }, []);

  // Handler para crear
  const handleCreateFabric = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      fabricTypeId,
      density,
      width,
      colorId,
      structurePattern,
      description,
      recipe, // array de { yarnId, proportion, etc.}
    };

    try {
      await createFabric(payload);
      setSnackbarMsg("Tejido creado exitosamente");
      setOpenSnackbar(true);
      // Redirigir
      router.push("/operaciones-new/tejidos");
    } catch (err) {
      console.error("Error al crear tejido:", err);
      alert("Ocurrió un error al crear el tejido.");
    }
  };

  // Diálogo de Hilados
  const handleOpenHiladosDialog = async () => {
    try {
      const hiladosResp = await fetchHilados();
      setHilados(hiladosResp.yarns || []);
      setHiladosDialogOpen(true);
    } catch (err) {
      console.error("Error al cargar hilados:", err);
      alert("No se pudo cargar la lista de hilados.");
    }
  };
  const handleCloseHiladosDialog = () => setHiladosDialogOpen(false);

  const handleSelectHilado = (h: any) => {
    // Agregar un item a la receta
    const newItem: RecipeItem = {
      yarnId: h.id,
      proportion: 0,
      numPlies: 1,
      gauge: 0,
      diameter: 0,
      stitchLength: 0,
    };
    setRecipe((prev) => [...prev, newItem]);
  };

  // Manejo local de recipe
  const handleRecipeFieldChange = (idx: number, field: keyof RecipeItem, value: number) => {
    setRecipe((prev) =>
      prev.map((item, i) =>
        i === idx ? { ...item, [field]: value } : item
      )
    );
  };
  const handleRemoveRecipeItem = (idx: number) => {
    setRecipe((prev) => prev.filter((_, i) => i !== idx));
  };

  // Table Pagination (Hilados)
  const handleChangePageH = (event: unknown, newPage: number) => setPaginaH(newPage);
  const handleChangeRowsPerPageH = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setFilasPorPaginaH(parseInt(event.target.value, 10));
    setPaginaH(0);
  };

  // Snackbar
  const handleCloseSnackbar = () => setOpenSnackbar(false);

  return (
    <div className="p-5">
      <h2 className="text-xl font-semibold mb-4">Crear Tejido</h2>
      <form onSubmit={handleCreateFabric} className="space-y-4">
        <div className="flex gap-4">
          <div className="w-1/2">
            <InputLabel id="fabric-type-label">Tipo de Tejido</InputLabel>
            <Select
              labelId="fabric-type-label"
              fullWidth
              value={fabricTypeId || ""}
              onChange={(e) => setFabricTypeId(Number(e.target.value))}
              style={{ marginBottom: "16px" }}
            >
              <MenuItem value="" disabled>
                -- Seleccione un tipo --
              </MenuItem>
              {fabricTypes.map((ft) => (
                <MenuItem key={ft.id} value={ft.id}>
                  {ft.value}
                </MenuItem>
              ))}
            </Select>
          </div>

          <div className="w-1/2">
            <InputLabel id="color-label">Color</InputLabel>
            <Select
              labelId="color-label"
              fullWidth
              value={colorId}
              onChange={(e) => setColorId(e.target.value as string)}
              style={{ marginBottom: "16px" }}
            >
              <MenuItem value="" disabled>
                -- Seleccione un color --
              </MenuItem>
              {colors.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name} ({c.sku})
                </MenuItem>
              ))}
            </Select>
          </div>
        </div>

        <TextField
          label="Densidad"
          type="number"
          fullWidth
          value={density}
          onChange={(e) => setDensity(parseInt(e.target.value, 10))}
        />
        <TextField
          label="Ancho"
          type="number"
          fullWidth
          value={width}
          onChange={(e) => setWidth(parseInt(e.target.value, 10))}
        />
        <TextField
          label="Patrón"
          fullWidth
          value={structurePattern}
          onChange={(e) => setStructurePattern(e.target.value)}
        />
        <TextField
          label="Descripción"
          fullWidth
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <h3 className="text-lg font-semibold mt-4 mb-2">Receta (Hilados)</h3>
        <Table size="small" className="w-full">
          <TableHead>
            <TableRow className="bg-blue-900 text-white text-center">
              <TableCell>Hilado (ID)</TableCell>
              <TableCell>Proporción</TableCell>
              <TableCell># Cabos</TableCell>
              <TableCell>Galga</TableCell>
              <TableCell>Diámetro</TableCell>
              <TableCell>Stitch Length</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recipe.map((item, idx) => (
              <TableRow key={idx} className="text-center">
                <TableCell>{item.yarnId}</TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    variant="standard"
                    value={item.proportion}
                    onChange={(e) =>
                      handleRecipeFieldChange(idx, "proportion", parseFloat(e.target.value))
                    }
                    style={{ width: "60px" }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    variant="standard"
                    value={item.numPlies}
                    onChange={(e) =>
                      handleRecipeFieldChange(idx, "numPlies", parseInt(e.target.value, 10))
                    }
                    style={{ width: "60px" }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    variant="standard"
                    value={item.gauge}
                    onChange={(e) =>
                      handleRecipeFieldChange(idx, "gauge", parseInt(e.target.value, 10))
                    }
                    style={{ width: "60px" }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    variant="standard"
                    value={item.diameter}
                    onChange={(e) =>
                      handleRecipeFieldChange(idx, "diameter", parseFloat(e.target.value))
                    }
                    style={{ width: "60px" }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    variant="standard"
                    value={item.stitchLength}
                    onChange={(e) =>
                      handleRecipeFieldChange(idx, "stitchLength", parseFloat(e.target.value))
                    }
                    style={{ width: "60px" }}
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleRemoveRecipeItem(idx)} color="error">
                    <Close />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Button
          variant="outlined"
          startIcon={<Add />}
          onClick={handleOpenHiladosDialog}
          style={{ marginTop: "8px" }}
        >
          Agregar Hilado
        </Button>

        <div className="flex justify-end gap-4 mt-6">
          <Button
            variant="contained"
            color="inherit"
            onClick={() => router.push("/operaciones-new/tejidos")}
          >
            Cancelar
          </Button>
          <Button variant="contained" color="primary" type="submit">
            Crear
          </Button>
        </div>
      </form>

      {/* Diálogo para seleccionar Hilados (tabla en español) */}
      <Dialog
        open={hiladosDialogOpen}
        onClose={handleCloseHiladosDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Seleccionar Hilado</DialogTitle>
        <DialogContent>
          <Table size="small">
            <TableHead>
              <TableRow className="bg-blue-900 text-white text-center">
                <TableCell>ID</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Count (Título)</TableCell>
                <TableCell>Color</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Acción</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {hilados
                .slice(paginaH * filasPorPaginaH, paginaH * filasPorPaginaH + filasPorPaginaH)
                .map((h) => (
                  <TableRow key={h.id} className="text-center">
                    <TableCell>{h.id}</TableCell>
                    <TableCell>{h.description}</TableCell>
                    <TableCell>{h.yarnCount}</TableCell>
                    <TableCell>{h.color?.name || ""}</TableCell>
                    <TableCell>
                      {h.isActive ? (
                        <span className="text-green-600">Activo</span>
                      ) : (
                        <span className="text-red-600">Inactivo</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        onClick={() => {
                          handleSelectHilado(h);
                        }}
                      >
                        Agregar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={hilados.length}
            page={paginaH}
            onPageChange={handleChangePageH}
            rowsPerPage={filasPorPaginaH}
            onRowsPerPageChange={handleChangeRowsPerPageH}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHiladosDialog}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success">
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default CrearTejido;
