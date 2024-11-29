import Breadcrumb from "@/common/components/Breadcrumb/Breadcrumb";
import RevisionStock from "../components/RevisionStock";
import DefaultLayout from "@/common/components/Layouts/DefaultLayout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Revisión de Stock ERP",
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
