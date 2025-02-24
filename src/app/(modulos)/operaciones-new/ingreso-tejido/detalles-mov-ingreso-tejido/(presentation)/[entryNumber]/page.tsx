import Breadcrumb from "@/common/components/Breadcrumb/Breadcrumb";
import DetallesMovIngresoTejido from "../components/DetallesMovIngresoTejido";
import DefaultLayout from "@/common/components/Layouts/DefaultLayout";
import { Metadata } from "next"; 

export const metadata: Metadata = {
  title: "Detalles Movimiento Ingreso de Tejido",
};


const TablesPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="DETALLES DE INGRESO DE TEJIDO" />
      <div className="flex flex-col gap-10">
        <DetallesMovIngresoTejido />
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;