import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Tabla1 from "@/components/Tables/Operaciones/RevisionStock/Tabla1";
import Tabla2 from "@/components/Tables/Operaciones/RevisionStock/Tabla2";


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
      <Breadcrumb pageName="Revisión de Stock" />

      <div className="flex flex-col gap-10">
        <Tabla1 />
        <Tabla2 />
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;
