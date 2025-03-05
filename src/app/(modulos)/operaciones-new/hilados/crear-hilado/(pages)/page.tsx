import Breadcrumb from "@/common/components/Breadcrumb/Breadcrumb";
import CrearHilado from "../components/CrearHilado";
import DefaultLayout from "@/common/components/Layouts/DefaultLayout";
import { Metadata } from "next"; 

export const metadata: Metadata = {
  title: "Crear Hilado",
};

const CrearHiladoPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Crear Hilado" />
      <div className="flex flex-col gap-10">
        <CrearHilado />
      </div>
    </DefaultLayout>
  );
};

export default CrearHiladoPage;
