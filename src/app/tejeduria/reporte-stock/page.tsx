import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Vista from "@/components/Tejeduria/ReporteStock/ReporteStock";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reporte de Stock ERP",
};

const TablesPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Reporte de Stock" />
      <div className="flex flex-col gap-10">
        <Vista/>
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;
