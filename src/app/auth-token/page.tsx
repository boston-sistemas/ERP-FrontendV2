import { Metadata } from "next";
import SignIn from '@/components/SignIn/SignIn';

export const metadata: Metadata = {
  title: "Login Boston ERP",
};

export default function SignInPage() {
  return <SignIn />;
}