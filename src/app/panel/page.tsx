import Panel from "@/components/Dashboard/Panel";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

export const metadata: Metadata = {
  title:
    "Panel Boston ERP"
};

export default function Home() {
  return (
    <>
      <DefaultLayout>
        <Panel />
      </DefaultLayout>
    </>
  );
}
