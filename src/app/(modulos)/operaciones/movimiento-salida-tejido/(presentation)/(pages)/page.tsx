import Breadcrumb from "@/common/components/Breadcrumb/Breadcrumb";
import MovSalidaHilado from "../components/Salidatejido";
import DefaultLayout from "@/common/components/Layouts/DefaultLayout";
import { Metadata } from "next"; 

export const metadata: Metadata = {
  title: "Movimiento Salida de Tejido",
};


const TablesPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="SALIDA DE TEJIDO" />
      <div className="flex flex-col gap-10">
        <MovSalidaHilado />
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;