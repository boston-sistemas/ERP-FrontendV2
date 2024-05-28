import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Tabla1 from "@/components/Tables/Tejeduria/ReporteStock/Tabla1";

import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

export const metadata: Metadata = {
  title: "Next.js Tables | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Tables page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
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
