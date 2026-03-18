import { AuthForm } from "@/components/auth-form";

export default function RegisterPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <AuthForm mode="register" />
    </main>
  );
}
