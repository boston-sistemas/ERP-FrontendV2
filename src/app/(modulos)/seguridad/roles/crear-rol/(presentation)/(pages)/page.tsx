import Breadcrumb from "@/common/components/Breadcrumb/Breadcrumb";
import CrearRol from "../components/crearRol";
import DefaultLayout from "@/common/components/Layouts/DefaultLayout";
import { Metadata } from "next"; 

export const metadata: Metadata = {
  title: "Crear Rol",
};

const CrearRolPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Crear Rol" />
      <div className="flex flex-col gap-10">
        <CrearRol />
      </div>
    </DefaultLayout>
  );
};

export default CrearRolPage;
