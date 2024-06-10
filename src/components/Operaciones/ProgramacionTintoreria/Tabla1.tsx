"use client";

import React, { useState, useEffect } from "react";
import { IconButton, Collapse } from "@mui/material";
import { ColorDeEstadoOrden } from "@/components/Parametros/ColorDeEstadoOrden";
import TablaExpandida from "./TablaExpandida";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { Orden, Suborden } from "./ProgramacionTintoreria";
import { TablePagination } from '@mui/material';
import { MAX_HEIGHT, minWidths1 } from "@/components/Parametros/TablasStock";
import "@/css/checkbox.css";

const columns = [
    "Orden",
    "Hilanderia",
    "Rollos Reportados (Kg)",
    "Peso Reportado (Kg)",
    "Estado",
];

interface Tabla1Props {
    data: Orden[];
    loading: boolean;
    fetchData: () => void;
    handleAgregarPartida: (selectedFilas: Suborden[]) => void;
}

const Tabla1: React.FC<Tabla1Props> = ({ data, loading, fetchData, handleAgregarPartida }) => {
    const [filasExpandidas, setFilasExpandidas] = useState<number[]>([]);
    const [pagina, setPagina] = useState(0);
    const [filasPorPagina, setFilasPorPagina] = useState(10);
    const [subordenesSeleccionadas, setSubordenesSeleccionadas] = useState<Suborden[]>([]);

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

    const agregarPartida = () => {
        handleAgregarPartida(subordenesSeleccionadas);
    };

    const onSeleccionar = (suborden: Suborden) => {
        setSubordenesSeleccionadas(prev => [...prev, suborden]);
    };

    return (
        <div>
            <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
                <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
                    Ordenes de Servicio - Pendientes
                </h4>
                <div className="max-w-full overflow-x-auto" style={{ maxHeight: MAX_HEIGHT, overflowY: 'auto' }}>
                    <table className="w-full table-auto">
                        <thead>
                            <tr className="bg-blue-900 uppercase text-center dark:bg-meta-4">
                                <th></th>
                                {columns.map((column, index) => (
                                    <th key={index} className={`px-4 py-4 text-center font-normal text-white dark:text-zinc-100 ${minWidths1[index + 1]}`}>
                                        {column}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={columns.length + 1} className="pt-5 pb-5 text-center text-black dark:text-white">
                                        Cargando...
                                    </td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length + 1} className="pt-5 pb-5 text-center text-black dark:text-white">
                                        No existen datos para esta consulta
                                    </td>
                                </tr>
                            ) : (
                                data
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
                                                        className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${ColorDeEstadoOrden(
                                                            data.estado
                                                        )}`}
                                                    >
                                                        {data.estado}
                                                    </p>
                                                </td>
                                            </tr>
                                            <tr className="bg-gray-100 dark:bg-gray-700">
                                                <td colSpan={columns.length + 1} className="p-0">
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
                    count={data.length}
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
                onClick={agregarPartida}
                className={`mt-4 w-full border border-gray-300 px-5 py-3 text-white transition bg-blue-800 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 dark:bg-blue-500 dark:hover:bg-blue-400`}
            >
                Agregar Partida
            </button>
        </div>
    );
};

export default Tabla1;