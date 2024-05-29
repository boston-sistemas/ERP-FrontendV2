import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Tabla1 from "@/components/Tejeduria/ReporteStock/Tablas/Tabla1";

import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

export const metadata: Metadata = {
  title: "Reporte de Stock ERP",
};

const TablesPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Reporte Stock" />

      <div className="flex flex-col gap-10">
        <Tabla1 />
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;
