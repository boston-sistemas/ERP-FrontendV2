import Breadcrumb from "@/common/components/Breadcrumb/Breadcrumb";
import Roles from "../components/Roles";
import DefaultLayout from "@/common/components/Layouts/DefaultLayout";
import { Metadata } from "next"; 

export const metadata: Metadata = {
  title: "Roles",
};


const TablesPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Roles" />
      <div className="flex flex-col gap-10">
        <Roles/>
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;