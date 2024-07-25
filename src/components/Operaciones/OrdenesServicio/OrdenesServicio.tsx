"use client";

import React, { useState } from 'react';
import FiltroTejeduria from './FiltroTejeduria';
import Orden from './Orden';
import { Box, Button } from '@mui/material';

const ordenesData = [
  {
    id: 1,
    codigo: 'FRA1489',
    hilanderia: 'Yadah',
    fecha: '2024-01-31',
    subordenes: [
      { id: 1, subcodigo: 'FRA1489RBV16541', peso: 70.50, os: 'FRA1492', tejido: 'RBV165', ancho: 39 },
      { id: 2, subcodigo: 'FRA1495RBV16541', peso: 295.39, os: 'FRA1492', tejido: 'RBV165', ancho: 36 },
    ],
  },
  {
    id: 2,
    codigo: 'FRA1490',
    hilanderia: 'Yadah',
    fecha: '2024-01-31',
    subordenes: [
      { id: 1, subcodigo: 'FRA1489RBV16541', peso: 70.50, os: 'FRA1492', tejido: 'RBV165', ancho: 39 },
      { id: 2, subcodigo: 'FRA1495RBV16541', peso: 295.39, os: 'FRA1492', tejido: 'RBV165', ancho: 36 },
      { id: 3, subcodigo: 'FRA1495RBV16541', peso: 295.39, os: 'FRA1492', tejido: 'RBV165', ancho: 36 },
    ],
  },
];

const OrdenesServicio = () => {
  const [tejeduria, setTejeduria] = useState('');

  const handleTejeduriaChange = (newTejeduria: string) => {
    setTejeduria(newTejeduria);
  };

  return (
    <Box className="space-y-5">
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
        <FiltroTejeduria tejeduria={tejeduria} onTejeduriaChange={handleTejeduriaChange} />
        <Button variant="contained" color="primary" className="bg-blue-900 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400">
          Obtener Ordenes
        </Button>
      </Box>
      {ordenesData.map((orden) => (
        <Orden key={orden.id} orden={orden} />
      ))}
    </Box>
  );
};

export default OrdenesServicio;
