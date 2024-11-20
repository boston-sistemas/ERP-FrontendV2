import Breadcrumb from "@/common/components/Breadcrumb/Breadcrumb";
import Tejidos from "../components/Tejidos";
import DefaultLayout from "@/common/components/Layouts/DefaultLayout";
import { Metadata } from "next"; 

export const metadata: Metadata = {
  title: "Tejidos",
};


const TablesPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="TEJIDOS" />
      <div className="flex flex-col gap-10">
        <Tejidos />
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;