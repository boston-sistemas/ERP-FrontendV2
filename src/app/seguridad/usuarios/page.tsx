import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Usuarios from "@/components/Seguridad/Usuarios/Usuarios";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { Metadata } from "next"; 

export const metadata: Metadata = {
  title: "Usuarios",
};


const TablesPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Usuarios" />
      <div className="flex flex-col gap-10">
        <Usuarios/>
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;