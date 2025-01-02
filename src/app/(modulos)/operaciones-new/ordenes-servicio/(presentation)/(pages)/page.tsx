import Breadcrumb from "@/common/components/Breadcrumb/Breadcrumb";
import OrdenesServicio from "../components/OrdenesServicio";
import DefaultLayout from "@/common/components/Layouts/DefaultLayout";
import { Metadata } from "next"; 

export const metadata: Metadata = {
  title: "Ordenes de Servicio",
};


const TablesPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="ÓRDENES DE SERVICIO" />
      <div className="flex flex-col gap-10">
        <OrdenesServicio />
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;