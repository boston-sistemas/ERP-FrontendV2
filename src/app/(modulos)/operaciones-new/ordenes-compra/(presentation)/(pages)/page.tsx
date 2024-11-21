import Breadcrumb from "@/common/components/Breadcrumb/Breadcrumb";
import OrdenesCompra from "../components/OrdenesCompra";
import DefaultLayout from "@/common/components/Layouts/DefaultLayout";
import { Metadata } from "next"; 

export const metadata: Metadata = {
  title: "Ordenes de Compra",
};


const TablesPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="ÓRDENES DE COMPRA" />
      <div className="flex flex-col gap-10">
        <OrdenesCompra />
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;