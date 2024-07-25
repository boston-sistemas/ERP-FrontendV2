"use client";

import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import SubOrden from './SubOrden';

interface SubOrdenData {
  id: number;
  subcodigo: string;
  peso: number;
  os: string;
  tejido: string;
  ancho: number;
}

interface OrdenData {
  id: number;
  codigo: string;
  hilanderia: string;
  fecha: string;
  subordenes: SubOrdenData[];
}

interface OrdenProps {
  orden: OrdenData;
}

const Orden: React.FC<OrdenProps> = ({ orden }) => {
  return (
    <Box mb={4} p={4} className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h6" className="text-black dark:text-white">Orden: {orden.codigo}</Typography>
        <Typography className="text-black dark:text-white">Programado: 1000 kg</Typography> {/*cambiar esto despues */}
      </Box>
      <Typography className="text-black dark:text-white">Hilanderia: {orden.hilanderia}</Typography>
      <Typography className="text-black dark:text-white">Fecha: {orden.fecha}</Typography>
      <Box mt={4}>
        {orden.subordenes.map((suborden) => (
          <SubOrden key={suborden.id} suborden={suborden} />
        ))}
      </Box>
      <Box display="flex" justifyContent="space-between" mt={4}>
        <Button variant="outlined" color="primary" className="bg-gray-200 dark:bg-gray-700 dark:text-white">
          Agregar Suborden
        </Button>
        <Button variant="contained" color="primary" className="bg-blue-900 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400">
          Crear
        </Button>
      </Box>
    </Box>
  );
};

export default Orden;
