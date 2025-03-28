import Breadcrumb from "@/common/components/Breadcrumb/Breadcrumb";
import DetallesMovSalidaHilado from "../components/DetallesMovSalidaHilado";
import DefaultLayout from "@/common/components/Layouts/DefaultLayout";
import { Metadata } from "next"; 

export const metadata: Metadata = {
  title: "Detalles Movimiento Salida de Hilado",
};

const TablesPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="DETALLES DE SALIDA DE HILADO" />
      <div className="flex flex-col gap-10">
        <DetallesMovSalidaHilado />
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;
