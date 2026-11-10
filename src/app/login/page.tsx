import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { FloatingLeaves } from "@/components/Motion";
import { LoginForm } from "@/components/AuthForm";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = { title: "Login" };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "farmer" ? "/dashboard" : "/crops");

  return (
    <div className="relative mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="relative overflow-hidden rounded-[2rem] border border-forest-100 bg-white p-8 shadow-[0_20px_60px_-30px_rgba(36,89,63,0.5)]">
        <FloatingLeaves count={4} />
        <div className="relative text-center">
          <span aria-hidden className="text-4xl">🌾</span>
          <h1 className="mt-2 font-display text-2xl font-black text-forest-900">Welcome back</h1>
          <p className="mt-1 text-sm text-soil-500">The fields missed you.</p>
        </div>
        <div className="relative mt-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
