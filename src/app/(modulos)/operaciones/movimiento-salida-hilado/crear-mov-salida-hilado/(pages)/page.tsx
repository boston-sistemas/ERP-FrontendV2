import Breadcrumb from "@/common/components/Breadcrumb/Breadcrumb";
import CrearMovSalidaHilado from "../components/CrearMovSalidaHilado";
import DefaultLayout from "@/common/components/Layouts/DefaultLayout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crear Movimiento Salida de Hilado",
};

const CrearMovSalidaPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="CREAR MOVIMIENTO DE SALIDA DE HILADO" />
      <div className="flex flex-col gap-10">
        <CrearMovSalidaHilado />
      </div>
    </DefaultLayout>
  );
};

export default CrearMovSalidaPage;
