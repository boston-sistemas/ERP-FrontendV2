import { Metadata } from "next";
import Inicio from "@/components/Inicio/Inicio";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

export const metadata: Metadata = {
  title: "Inicio ERP",
};

export default function InicioPage() {
  return (
    <>
      <DefaultLayout>
        <Inicio />
      </DefaultLayout>
    </>
  );
}
