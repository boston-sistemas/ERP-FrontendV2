"use client";

import React, { useState, useEffect } from "react";
import instance from "@/config/AxiosConfig";
import { TIMEOUT } from "@/components/Parametros/Parametros";
import { Select, MenuItem, Card, CardContent, Typography, IconButton, Collapse, TablePagination } from "@mui/material";
import { TbTruckDelivery } from "react-icons/tb";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { ColorDeEstadoOrden } from "@/components/Parametros/ColorDeEstadoOrden";
import TablaExpandida from "./TablaExpandida";
import "@/css/checkbox.css";
import { SelectChangeEvent } from '@mui/material/Select';


export interface Orden {
  hilanderia: string;
  rollos: number;
  peso: number;
  orden: string;
  fecha: string;
  estado: string;
  expandida: Suborden[];
}

interface Color {
  nombre: string;
  descripcion: string | null;
  color_id: number;
}

export interface Suborden {
  tejido: string;
  densidad: string;
  ancho: string;
  fibra: string;
  rollos: number;
  cantidad: number;
  kg_por_rollo: number;
  estado: string;
}

interface Partida {
  id: number;
  hilanderia: string;
  suborden: string;
  a_disponer: number;
  rollos: number;
  peso: number;
  kg_por_rollo: number;
  tintoreria: string;
  color: string;
}

export const roundToTwo = (num: number) => Math.round(num * 100) / 100;

const calculateGlobalState = (detalles: Suborden[]): string => {
  const estados = detalles.map((detalle: { estado: string }) => detalle.estado);
  if (estados.every(estado => estado === "LISTO")) {
    return "LISTO";
  }
  if (estados.some(estado => estado === "DETENIDO")) {
    return "DETENIDO";
  }
  if (estados.some(estado => estado === "EN CURSO")) {
    return "EN CURSO";
  }
  return "NO INICIADO";
};

const processOrderData = (orders: any[]): Orden[] => {
  return orders.map(order => {
    const totalRollos = order.detalles.reduce((sum: number, detalle: { reporte_tejeduria_nro_rollos: number }) => sum + detalle.reporte_tejeduria_nro_rollos, 0);
    const totalPeso = order.detalles.reduce((sum: number, detalle: { reporte_tejeduria_cantidad_kg: string }) => sum + parseFloat(detalle.reporte_tejeduria_cantidad_kg), 0);
    const estado = calculateGlobalState(order.detalles);

    return {
      orden: order.orden_servicio_tejeduria_id,
      hilanderia: "POR DEFINIR",
      fecha: order.fecha.slice(0, 10),
      rollos: totalRollos,
      peso: totalPeso,
      estado: estado,
      expandida: order.detalles.map((detalle: { crudo_id: string; reporte_tejeduria_nro_rollos: number; reporte_tejeduria_cantidad_kg: string; estado: string }) => ({
        tejido: detalle.crudo_id.slice(0, 3),
        densidad: detalle.crudo_id.slice(3, 6),
        ancho: detalle.crudo_id.slice(-2),
        fibra: "POR DEFINIR",
        rollos: detalle.reporte_tejeduria_nro_rollos,
        cantidad: roundToTwo(parseFloat(detalle.reporte_tejeduria_cantidad_kg)),
        kg_por_rollo: roundToTwo(parseFloat(detalle.reporte_tejeduria_cantidad_kg) / detalle.reporte_tejeduria_nro_rollos),
        estado: detalle.estado
      }))
    };
  });
};

const ProgramacionTintoreria: React.FC = () => {
  const [pendienteData, setPendienteData] = useState<Orden[]>([]);
  const [cerradaData, setCerradaData] = useState<Orden[]>([]);
  const [loading, setLoading] = useState(false);
  const [tejeduria, setTejeduria] = useState('');
  const [tintoreria, setTintoreria] = useState('');
  const [tejedurias, setTejedurias] = useState<{ proveedor_id: string; razon_social: string; alias: string }[]>([]);
  const [tintorerias, setTintorerias] = useState<{ proveedor_id: string; razon_social: string; alias: string }[]>([]);
  const [colores, setColores] = useState<Color[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [partidas, setPartidas] = useState<Partida[]>([]);
  const [filasExpandidas, setFilasExpandidas] = useState<number[]>([]);
  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [subordenesSeleccionadas, setSubordenesSeleccionadas] = useState<Suborden[]>([]);
  const [rollosDisponibles, setRollosDisponibles] = useState<Record<string, number>>({});

  const fetchData = async (tejeduriaId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await instance.get(`/operations/v1/programacion-tintoreria/${tejeduriaId}/stock`);
      const data = response.data;
      const pendienteData = processOrderData(data.ordenes);
      const cerradaData = processOrderData(data.ordenes_cerradas || []);
      setPendienteData(pendienteData);
      setCerradaData(cerradaData);

      // Initialize rollosDisponibles
      const rollosMap: Record<string, number> = {};
      pendienteData.forEach(order => {
        order.expandida.forEach(suborden => {
          const idSuborden = `${suborden.tejido}-${suborden.densidad}-${suborden.ancho}`;
          rollosMap[idSuborden] = suborden.rollos;
        });
      });
      setRollosDisponibles(rollosMap);

    } catch (error) {
      console.error('Error fetching data', error);
      setError('Error fetching data');
    } finally {
      setTimeout(() => setLoading(false), TIMEOUT);
    }
  };

  const handleParametrosTejTinCol = async () => {
    try {
      const response = await instance.get('/operations/v1/programacion-tintoreria');
      const data = response.data;
      setTejedurias(data.tejedurias);
      setTintorerias(data.tintorerias);
      setColores(data.colores);
    } catch (error) {
      console.error('Error fetching parametros', error);
      setError('Error fetching parametros');
    }
  };

  useEffect(() => {
    handleParametrosTejTinCol();
  }, []);

  const handleTejeduriaChange = (alias: string) => {
    setTejeduria(alias);
    setPendienteData([]);
    setCerradaData([]);
    setError('');

  };

  const handleUltimoStock = () => {
    if (tejeduria) {
      const selectedTejeduria = tejedurias.find(t => t.alias === tejeduria);
      if (selectedTejeduria) {
        fetchData(selectedTejeduria.proveedor_id);
      }
    } else {
      setError('Por favor, selecciona una tejeduría');
    }
  };

  const handleTintoreriaChange = (event: SelectChangeEvent<string>) => {
    const selectedTintoreria = event.target.value as string;
    setTintoreria(selectedTintoreria);
    if (selectedTintoreria) {
      setError(null);
    }
  };
  

  const handleAgregarPartida = (subordenesSeleccionadas: Suborden[]) => {
    if (!tintoreria) {
      setError('Por favor, selecciona una tintorería');
      return;
    }
    setError(null)

    const nuevasPartidas = subordenesSeleccionadas.map((suborden, index) => {
      const idSuborden = `${suborden.tejido}-${suborden.densidad}-${suborden.ancho}`;
      const rollosIniciales = rollosDisponibles[idSuborden] ?? suborden.rollos;

      return {
        id: partidas.length + index + 1,
        hilanderia: 'POR DEFINIR',
        suborden: idSuborden,
        a_disponer: rollosIniciales,
        rollos: 0,
        peso: 0,
        kg_por_rollo: suborden.kg_por_rollo,
        tintoreria: tintoreria,
        color: ''
      };
    });

    setPartidas([...partidas, ...nuevasPartidas]);
  };

  const handleExpandirFila = (index: number) => {
    if (filasExpandidas.includes(index)) {
      setFilasExpandidas(filasExpandidas.filter(rowIndex => rowIndex !== index));
    } else {
      setFilasExpandidas([...filasExpandidas, index]);
    }
  };

  const handleCambiarPagina = (event: any, newPage: any) => {
    setPagina(newPage);
  };

  const handleCambiarFilasPorPagina = (event: any) => {
    setFilasPorPagina(parseInt(event.target.value, 10));
    setPagina(0);
  };

  const onSeleccionar = (suborden: Suborden, seleccionado: boolean) => {
    if (seleccionado) {
      setSubordenesSeleccionadas(prev => [...prev, suborden]);
    } else {
      setSubordenesSeleccionadas(prev => prev.filter(s => s !== suborden));
    }
  };

  const handleRollosChange = (partidaIndex: number, value: string) => {
    const newPartidas = [...partidas];
    const partida = newPartidas[partidaIndex];
    const idSuborden = partida.suborden;
    const rollosDisponiblesActuales = rollosDisponibles[idSuborden] ?? partida.a_disponer;

    // Handle empty input or non-numeric input
    const newValue = value === "" ? 0 : parseInt(value);
    if (isNaN(newValue)) {
      return;
    }

    const rollosDiff = newValue - partida.rollos;

    if (rollosDisponiblesActuales - rollosDiff >= 0) {
      partida.rollos = newValue;
      partida.peso = roundToTwo(newValue * partida.kg_por_rollo);
      setPartidas(newPartidas);

      // Update rollosDisponibles
      setRollosDisponibles(prev => ({
        ...prev,
        [idSuborden]: rollosDisponiblesActuales - rollosDiff
      }));

      // Update a_disponer for all partidas with the same suborden
      setPartidas(prevPartidas =>
        prevPartidas.map(p =>
          p.suborden === idSuborden
            ? { ...p, a_disponer: rollosDisponibles[idSuborden] }
            : p
        )
      );
    }
  };

  const handleColorChange = (index: number, value: string) => {
    const newPartidas = [...partidas];
    newPartidas[index].color = value;
    setPartidas(newPartidas);
  };

  return (
    <div className="space-y-5">
      <div className="overflow-x-auto mb-6">
        <div className="flex items-start space-x-6 min-w-max">
          <Card className="dark:bg-boxdark">
            <CardContent className="flex flex-col items-start space-y-2">
              <Typography variant="subtitle1" className="dark:text-white">Tejeduría</Typography>
              <div>
                <Select
                  value={tejeduria}
                  onChange={(e) => handleTejeduriaChange(e.target.value)}
                  displayEmpty
                  className="w-60 h-12 rounded border-[1.5px] border-stroke bg-transparent px-2 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                >
                  <MenuItem value="" disabled>Selecciona una opción</MenuItem>
                  {tejedurias.map(tejeduria => (
                    <MenuItem key={tejeduria.proveedor_id} value={tejeduria.alias}>{tejeduria.alias}</MenuItem>
                  ))}
                </Select>
                <button
                  onClick={handleUltimoStock}
                  className="ml-5 bg-black border border-gray-300 text-white px-5 py-3 transition duration-200 ease-in-out hover:bg-neutral-600"
                >
                  Obtener Último Stock
                </button>
              </div>
            </CardContent>
          </Card>
          <TbTruckDelivery className="mt-9 text-6xl text-black dark:text-neutral-300" />
          <Card className="dark:bg-boxdark">
            <CardContent className="flex flex-col items-start space-y-2">
              <Typography variant="subtitle1" className="dark:text-white">Tintorería</Typography>
              <div>
                <Select
                  value={tintoreria}
                  onChange={handleTintoreriaChange}
                  displayEmpty
                  className="w-60 h-12 rounded border-[1.5px] border-stroke bg-transparent px-2 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                >
                  <MenuItem value="" disabled>Selecciona una opción</MenuItem>
                  {tintorerias.map(tintoreria => (
                    <MenuItem key={tintoreria.proveedor_id} value={tintoreria.alias}>{tintoreria.alias}</MenuItem>
                  ))}
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {error && (
        <div className="text-red-500">{error}</div>
      )}
      <div>
        <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
            Ordenes de Servicio - Pendientes
          </h4>
          <div className="max-w-full overflow-x-auto" style={{ maxHeight: "500px", overflowY: 'auto' }}>
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-blue-900 uppercase text-center dark:bg-meta-4">
                  <th></th>
                  {["Orden", "Hilanderia", "Rollos Reportados (Kg)", "Peso Reportado (Kg)", "Estado"].map((column, index) => (
                    <th key={index} className={`px-4 py-4 text-center font-normal text-white dark:text-zinc-100`}>
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="pt-5 pb-5 text-center text-black dark:text-white">
                      Cargando...
                    </td>
                  </tr>
                ) : pendienteData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="pt-5 pb-5 text-center text-black dark:text-white">
                      No existen datos para esta consulta
                    </td>
                  </tr>
                ) : (
                  pendienteData
                    .slice(pagina * filasPorPagina, pagina * filasPorPagina + filasPorPagina)
                    .map((data, index) => (
                      <React.Fragment key={index}>
                        <tr className="text-center">
                          <td className="w-10 border-b border-[#eee] px-8 py-5 dark:border-strokedark">
                            <IconButton
                              onClick={() => handleExpandirFila(index)}
                              className="text-inherit dark:text-white"
                            >
                              {filasExpandidas.includes(index) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                          </td>
                          <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                            <p className="font-normal text-black dark:text-white">{data.orden}</p>
                          </td>
                          <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                            <p className="font-normal text-black dark:text-white">{data.hilanderia}</p>
                          </td>
                          <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                            <p className="font-normal text-black dark:text-white">{data.rollos}</p>
                          </td>
                          <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                            <p className="font-normal text-black dark:text-white">{data.peso}</p>
                          </td>
                          <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                            <p
                              className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${ColorDeEstadoOrden(data.estado)}`}
                            >
                              {data.estado}
                            </p>
                          </td>
                        </tr>
                        <tr className="bg-gray-100 dark:bg-gray-700">
                          <td colSpan={6} className="p-0">
                            <Collapse in={filasExpandidas.includes(index)} timeout="auto" unmountOnExit>
                              <TablaExpandida data={data.expandida} onSeleccionar={onSeleccionar} />
                            </Collapse>
                          </td>
                        </tr>
                      </React.Fragment>
                    ))
                )}
              </tbody>
            </table>
          </div>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={pendienteData.length}
            rowsPerPage={filasPorPagina}
            page={pagina}
            onPageChange={handleCambiarPagina}
            onRowsPerPageChange={handleCambiarFilasPorPagina}
            labelRowsPerPage="Filas por página:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`}
            sx={{ color: (theme) => theme.palette.mode === 'dark' ? '#ffffff' : 'inherit' }}
          />
        </div>
        <button
          onClick={() => handleAgregarPartida(subordenesSeleccionadas)}
          className="mt-4 w-full border border-gray-300 px-5 py-3 text-white transition bg-blue-800 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 dark:bg-blue-500 dark:hover:bg-blue-400"
        >
          Agregar Partida
        </button>
      </div>
      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
          Partidas
        </h4>
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-blue-900 uppercase text-center dark:bg-meta-4">
                {["Partida", "Hilanderia", "Suborden", "A Disponer", "Rollos", "Peso", "Tintoreria", "Color"].map((column, index) => (
                  <th key={index} className="px-4 py-4 text-center font-normal text-white dark:text-zinc-100">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="pt-5 pb-5 text-center text-black dark:text-white">
                    Cargando...
                  </td>
                </tr>
              ) : partidas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="pt-5 pb-5 text-center text-black dark:text-white">
                    No existen partidas para mostrar
                  </td>
                </tr>
              ) : (
                partidas.map((partida, index) => (
                  <tr key={index} className="text-center">
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      {partida.id}
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      {partida.hilanderia}
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      {partida.suborden}
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      {rollosDisponibles[partida.suborden] ?? partida.a_disponer}
                    </td>
                    <td className="text-black border-b border-[#eee] px-4 py-5 dark:text-white dark:border-strokedark">
                      <input
                        type="text"
                        value={partida.rollos}
                        onChange={(e) => handleRollosChange(index, e.target.value)}
                        className="w-20 border-[1.5px] border-neutral-500 bg-transparent px-3 py-1.5 text-center text-black outline-none transition focus:border-blue-800 active:border-blue-800 disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-blue-800"
                        inputMode="numeric"
                      />
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      {partida.peso}
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      {partida.tintoreria}
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      <Select
                        value={partida.color}
                        onChange={(e) => handleColorChange(index, e.target.value as string)}
                        displayEmpty
                        className="w-60 h-12 rounded border-[1.5px] border-stroke bg-transparent px-2 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      >
                        <MenuItem value="" disabled>Selecciona color</MenuItem>
                        {colores.map(color => (
                          <MenuItem key={color.color_id} value={color.nombre}>
                            {color.nombre}
                          </MenuItem>
                        ))}
                      </Select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProgramacionTintoreria;
