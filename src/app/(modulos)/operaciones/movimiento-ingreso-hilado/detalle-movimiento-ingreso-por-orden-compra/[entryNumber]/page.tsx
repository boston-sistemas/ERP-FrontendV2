import Breadcrumb from "@/common/components/Breadcrumb/Breadcrumb";
import DetallesMovIngresoHilado from "../components/DetallesMovIngresoHilado";
import DefaultLayout from "@/common/components/Layouts/DefaultLayout";
import { Metadata } from "next"; 

export const metadata: Metadata = {
  title: "MOVIMIENTO DE INGRESO DE HILADO POR ORDEN DE COMPRA",
};

const TablesPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="MOVIMIENTO DE INGRESO DE HILADO POR ORDEN DE COMPRA" />
      <div className="flex flex-col gap-10">
        <DetallesMovIngresoHilado />
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;
