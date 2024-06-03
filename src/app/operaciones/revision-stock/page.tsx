import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import RevisionStock from "@/components/Operaciones/RevisionStock/RevisionStock";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Revision de Stock ERP",
};

const TablesPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Revisión de Stock" />
      <div className="flex flex-col gap-10">
        <RevisionStock/>
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;
