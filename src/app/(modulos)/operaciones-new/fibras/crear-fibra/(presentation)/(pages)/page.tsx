import Breadcrumb from "@/common/components/Breadcrumb/Breadcrumb";
import CrearFibra from "../components/CrearFibra";
import DefaultLayout from "@/common/components/Layouts/DefaultLayout";
import { Metadata } from "next"; 

export const metadata: Metadata = {
  title: "Crear Fibra",
};

const CrearFibraPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Crear Fibra" />
      <div className="flex flex-col gap-10">
        <CrearFibra />
      </div>
    </DefaultLayout>
  );
};

export default CrearFibraPage;
