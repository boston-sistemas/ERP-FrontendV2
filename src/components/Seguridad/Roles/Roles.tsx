// src/components/Seguridad/Roles/Roles.tsx
"use client"

import React, { useEffect, useState } from 'react';
import instance from '../../../config/AxiosConfig';

interface Acceso {
  acceso_id: number;
  nombre: string;
  is_active: boolean;
}

interface Rol {
  rol_id: number;
  nombre: string;
  is_active: boolean;
  accesos: Acceso[];
}

const Roles: React.FC = () => {
  const [roles, setRoles] = useState<Rol[]>([]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await instance.get('/security/v1/roles/');
        setRoles(response.data.roles);
      } catch (error) {
        console.error('Error fetching roles:', error);
      }
    };

    fetchRoles();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Roles</h1>
      <button className="mb-4 p-2 bg-blue-500 text-white rounded">Crear Rol</button>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">ID</th>
            <th className="py-2 px-4 border-b">Nombre</th>
            <th className="py-2 px-4 border-b">Estado</th>
            <th className="py-2 px-4 border-b">Accesos</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((rol) => (
            <tr key={rol.rol_id}>
              <td className="py-2 px-4 border-b">{rol.rol_id}</td>
              <td className="py-2 px-4 border-b">{rol.nombre}</td>
              <td className="py-2 px-4 border-b">{rol.is_active ? 'Activo' : 'Inactivo'}</td>
              <td className="py-2 px-4 border-b">
                {rol.accesos.map((acceso) => (
                  <span key={acceso.acceso_id} className="mr-2">
                    {acceso.nombre}
                  </span>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Roles;