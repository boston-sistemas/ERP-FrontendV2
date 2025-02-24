import Breadcrumb from "@/common/components/Breadcrumb/Breadcrumb";
import DetallesOrdenServicio from "../components/DetallesOrdenServicio";
import DefaultLayout from "@/common/components/Layouts/DefaultLayout";
import { Metadata } from "next"; 

export const metadata: Metadata = {
  title: "Detalles Orden de Servicio",
};

const TablesPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="DETALLES DE ORDEN DE SERVICIO" />
      <div className="flex flex-col gap-10">
        <DetallesOrdenServicio />
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;
