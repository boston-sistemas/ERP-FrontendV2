import Breadcrumb from "@/common/components/Breadcrumb/Breadcrumb";
import Usuarios from "@/app/(modulos)/seguridad/usuarios/(presentation)/components/Usuarios";
import DefaultLayout from "@/common/components/Layouts/DefaultLayout";
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