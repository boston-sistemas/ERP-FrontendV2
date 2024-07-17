import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import TablaMovimientos from "@/components/Operaciones/MovimientosIngresoCrudo/Tabla";

const MovimientosIngresoCrudoPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Registro de movimientos" />
      <div className="flex flex-col gap-10">
        <TablaMovimientos />
      </div>
    </DefaultLayout>
  );
};

export default MovimientosIngresoCrudoPage;
