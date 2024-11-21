import Breadcrumb from "@/common/components/Breadcrumb/Breadcrumb";
import DetallesMovIngresoHilado from "../components/DetallesMovIngresoHilado";
import DefaultLayout from "@/common/components/Layouts/DefaultLayout";
import { Metadata } from "next"; 

export const metadata: Metadata = {
  title: "Detalles Movimiento Ingreso de Hilado",
};


const TablesPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="DETALLES DE INGRESO DE HILADO" />
      <div className="flex flex-col gap-10">
        <DetallesMovIngresoHilado />
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;