"use client";

import React, { useState, useEffect } from "react";
import { fetchOrders } from "../../use-cases/fetchOrders";
import { Orden, processOrderData } from "../../use-cases/processOrderData";
import Tabla1 from "./Tabla1";
import Tabla2 from "./Tabla2";
import { TIMEOUT } from "@/components/Parametros/Parametros";

const RevisionStock: React.FC = () => {
  const [pendienteData, setPendienteData] = useState<Orden[]>([]);
  const [cerradaData, setCerradaData] = useState<Orden[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const data = await fetchOrders();
      const pendienteData = processOrderData(data.ordenes_pendientes);
      const cerradaData = processOrderData(data.ordenes_cerradas);
      setPendienteData(pendienteData);
      setCerradaData(cerradaData);
    } catch (error) {
      console.error('Error fetching data', error);
    }
    setTimeout(() => setLoading(false), TIMEOUT);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-10">
      <Tabla1 data={pendienteData} loading={loading} fetchData={fetchData} />
      <Tabla2 data={cerradaData} loading={loading} />
    </div>
  );
};

export default RevisionStock;
