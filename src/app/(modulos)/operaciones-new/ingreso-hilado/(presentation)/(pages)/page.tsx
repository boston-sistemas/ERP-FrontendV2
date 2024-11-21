import Breadcrumb from "@/common/components/Breadcrumb/Breadcrumb";
import MovIngresoHilado from "../components/MovIngresHilado";
import DefaultLayout from "@/common/components/Layouts/DefaultLayout";
import { Metadata } from "next"; 

export const metadata: Metadata = {
  title: "Movimiento Ingreso de Hilado",
};


const TablesPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="INGRESO DE HILADO" />
      <div className="flex flex-col gap-10">
        <MovIngresoHilado />
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;