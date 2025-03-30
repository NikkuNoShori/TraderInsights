import { RegisterForm } from "@/components/auth/RegisterForm";
import { AuthLayout } from "@/components/auth/AuthLayout";

export default function Register() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Enter your details below to create your account"
    >
      <RegisterForm />
    </AuthLayout>
  );
} 