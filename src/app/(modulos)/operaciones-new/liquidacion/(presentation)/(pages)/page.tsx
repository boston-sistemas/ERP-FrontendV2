import Breadcrumb from "@/common/components/Breadcrumb/Breadcrumb";
import Liquidacion from "../components/Liquidacion";
import DefaultLayout from "@/common/components/Layouts/DefaultLayout";
import { Metadata } from "next"; 

export const metadata: Metadata = {
  title: "Liquidacion",
};


const TablesPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="LIQUIDACION" />
      <div className="flex flex-col gap-10">
        <Liquidacion />
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;