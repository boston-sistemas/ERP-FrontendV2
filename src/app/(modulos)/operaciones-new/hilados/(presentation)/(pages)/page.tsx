import Breadcrumb from "@/common/components/Breadcrumb/Breadcrumb";
import Hilados from "../components/Hilados";
import DefaultLayout from "@/common/components/Layouts/DefaultLayout";
import { Metadata } from "next"; 

export const metadata: Metadata = {
  title: "Hilados",
};


const TablesPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="HILADOS" />
      <div className="flex flex-col gap-10">
        <Hilados />
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;