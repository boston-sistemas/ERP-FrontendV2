import { Metadata } from "next";
import AuthToken from "../components/AuthToken";

export const metadata: Metadata = {
  title: "2FA Boston ERP",
};

export default function AuthPage() {
  return <AuthToken />;
}