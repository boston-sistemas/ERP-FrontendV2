import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Roles from "@/components/Seguridad/Roles/Roles";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { Metadata } from "next"; 

export const metadata: Metadata = {
  title: "Roles",
};


const TablesPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Roles" />
      <div className="flex flex-col gap-10">
        <Roles/>
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;