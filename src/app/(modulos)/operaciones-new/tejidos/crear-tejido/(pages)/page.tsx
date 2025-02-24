import Breadcrumb from "@/common/components/Breadcrumb/Breadcrumb";
import CrearTejido from "../components/CrearTejido";
import DefaultLayout from "@/common/components/Layouts/DefaultLayout";
import { Metadata } from "next"; 

export const metadata: Metadata = {
  title: "Crear Tejido",
};

const CrearTejidoPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Crear Tejido" />
      <div className="flex flex-col gap-10">
        <CrearTejido />
      </div>
    </DefaultLayout>
  );
};

export default CrearTejidoPage;
