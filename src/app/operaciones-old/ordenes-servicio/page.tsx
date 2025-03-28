import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import OrdenesServicio from "@/components/Operaciones/OrdenesServicio/OrdenesServicio";

const OrdenesServicioPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Ordenes de Servicio" />
      <div className="flex flex-col gap-10 p-6">
        <OrdenesServicio />
      </div>
    </DefaultLayout>
  );
};

export default OrdenesServicioPage;
