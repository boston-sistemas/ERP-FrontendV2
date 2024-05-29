import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Tabla1 from "@/components/Operaciones/ProgramacionATintoreria/Tabla1";
import Tabla2 from "@/components/Operaciones/ProgramacionATintoreria/Tabla2";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

export const metadata: Metadata = {
  title: "Envio de Programacion a Tintoreria",
};

const TablesPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="EPT" />

      <div className="flex flex-col gap-10">
        <Tabla1 />
        <Tabla2 />
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;
