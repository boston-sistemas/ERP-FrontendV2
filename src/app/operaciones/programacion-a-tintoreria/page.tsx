import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import ProgramacionATintoreria from "@/components/Operaciones/ProgramacionATintoreria/ProgramacionATintoreria";
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
        <ProgramacionATintoreria/>
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;
