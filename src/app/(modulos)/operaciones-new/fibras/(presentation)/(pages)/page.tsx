import Breadcrumb from "@/common/components/Breadcrumb/Breadcrumb";
import Fibras from "../components/Fibras";
import DefaultLayout from "@/common/components/Layouts/DefaultLayout";
import { Metadata } from "next"; 

export const metadata: Metadata = {
  title: "Fibras",
};


const TablesPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="FIBRAS" />
      <div className="flex flex-col gap-10">
        <Fibras />
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;