"use client";

import React from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface SubOrdenData {
  id: number;
  subcodigo: string;
  peso: number;
  os: string;
  tejido: string;
  ancho: number;
}

interface SubOrdenProps {
  suborden: SubOrdenData;
}

const SubOrden: React.FC<SubOrdenProps> = ({ suborden }) => {
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} p={2} border="1px solid #ddd" borderRadius="8px" className="bg-white dark:bg-gray-800 shadow-md">
      <Typography className="text-black dark:text-white">SubOrden: {suborden.subcodigo}</Typography>
      <Typography className="text-black dark:text-white">Peso: {suborden.peso}</Typography>
      <Typography className="text-black dark:text-white">OS: {suborden.os}</Typography>
      <Typography className="text-black dark:text-white">Tejido: {suborden.tejido}</Typography>
      <Typography className="text-black dark:text-white">Ancho: {suborden.ancho}</Typography>
      <IconButton color="error">
        <DeleteIcon />
      </IconButton>
    </Box>
  );
};

export default SubOrden;
