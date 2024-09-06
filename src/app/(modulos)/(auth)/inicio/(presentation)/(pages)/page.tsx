import { Metadata } from "next";
import DefaultLayout from "@/common/components/Layouts/DefaultLayout";
import Inicio from "../components/Inicio";

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
