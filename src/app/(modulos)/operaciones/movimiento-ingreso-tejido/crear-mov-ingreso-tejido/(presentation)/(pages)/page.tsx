import Breadcrumb from "@/common/components/Breadcrumb/Breadcrumb";
import CrearIngresoTejido from "../componentes/CrearMovIngresoTejido";
import DefaultLayout from "@/common/components/Layouts/DefaultLayout";
import { Metadata } from "next"; 

export const metadata: Metadata = {
  title: "Movimiento Ingreso de Tejido",
};


const TablesPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="INGRESO DE TEJIDO" />
      <div className="flex flex-col gap-10">
        <CrearIngresoTejido />
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;