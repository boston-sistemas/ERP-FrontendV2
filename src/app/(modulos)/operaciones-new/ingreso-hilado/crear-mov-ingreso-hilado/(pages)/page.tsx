import Breadcrumb from "@/common/components/Breadcrumb/Breadcrumb";
import CrearMovIngresoHilado from "../components/CrearMovIngresoHilado";
import DefaultLayout from "@/common/components/Layouts/DefaultLayout";
import { Metadata } from "next"; 

export const metadata: Metadata = {
  title: "Crear Movimiento Ingreso de Hilado",
};


const TablesPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="CREAR MOVIMIENTO INGRESO DE HILADO" />
      <div className="flex flex-col gap-10">
        <CrearMovIngresoHilado />
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;