import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import ProgramacionTintoreria from "@/components/Operaciones/ProgramacionTintoreria/ProgramacionTintoreria";
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
        <ProgramacionTintoreria/>
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;
