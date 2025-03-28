import Breadcrumb from "@/common/components/Breadcrumb/Breadcrumb";
import MovIngresoTejido from "../components/MovIngresoTejido";
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
        <MovIngresoTejido />
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;