import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import CrearRol from "../components/crearRol";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
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
