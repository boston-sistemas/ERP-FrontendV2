import Breadcrumb from "@/common/components/Breadcrumb/Breadcrumb";
import CrearUsuario from "../components/CrearUsuario";
import DefaultLayout from "@/common/components/Layouts/DefaultLayout";
import { Metadata } from "next"; 

export const metadata: Metadata = {
  title: "Crear Usuario",
};


const TablesPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Crear Usuario" />
      <div className="flex flex-col gap-10">
        <CrearUsuario/>
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;