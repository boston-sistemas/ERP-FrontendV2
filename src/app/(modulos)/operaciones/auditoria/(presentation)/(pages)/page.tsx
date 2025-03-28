import Breadcrumb from "@/common/components/Breadcrumb/Breadcrumb";
import RegistroAuditoria from "../components/RegistroAuditoria";
import DefaultLayout from "@/common/components/Layouts/DefaultLayout";
import { Metadata } from "next"; 

export const metadata: Metadata = {
  title: "Registro de Auditoria",
};


const TablesPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="REGISTRO DE AUDITORIA" />
      <div className="flex flex-col gap-10">
        <RegistroAuditoria />
      </div>
    </DefaultLayout>
  );
};

export default TablesPage;