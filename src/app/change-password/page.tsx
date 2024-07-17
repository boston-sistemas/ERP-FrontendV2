import { Metadata } from "next";
import ChangePassword from "@/components/ChangePassword/ChangePassword";

export const metadata: Metadata = {
  title: "Cambiar Contraseña",
};

export default function ChangePasswordPage() {
  return < ChangePassword/>;
}