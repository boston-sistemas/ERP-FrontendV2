"use client";

import React from 'react';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

interface FiltroTejeduriaProps {
  tejeduria: string;
  onTejeduriaChange: (tejeduria: string) => void;
}

const FiltroTejeduria: React.FC<FiltroTejeduriaProps> = ({ tejeduria, onTejeduriaChange }) => {
  return (
    <FormControl variant="outlined" size="small" className="w-full max-w-xs">
      <InputLabel className="dark:text-zinc-100">Tejeduria</InputLabel>
      <Select
        value={tejeduria}
        onChange={(e) => onTejeduriaChange(e.target.value as string)}
        label="Tejeduria"
        className="dark:text-zinc-100"
        MenuProps={{
          PaperProps: {
            className: "dark:bg-gray-700",
          },
        }}
      >
        <MenuItem value="">---</MenuItem>
        <MenuItem value="FRA">FRA</MenuItem>
        <MenuItem value="TIR">TIR</MenuItem>
        {/* Agrega más opciones según sea necesario */}
      </Select>
    </FormControl>
  );
};

export default FiltroTejeduria;
