import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { FloatingLeaves } from "@/components/Motion";
import { RegisterForm } from "@/components/AuthForm";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = { title: "Join AgriConnect" };
export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "farmer" ? "/dashboard" : "/crops");

  return (
    <div className="relative mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="relative overflow-hidden rounded-[2rem] border border-forest-100 bg-white p-8 shadow-[0_20px_60px_-30px_rgba(36,89,63,0.5)] sm:p-10">
        <FloatingLeaves count={4} />
        <div className="relative text-center">
          <span aria-hidden className="text-4xl">🌱</span>
          <h1 className="mt-2 font-display text-2xl font-black text-forest-900">Join AgriConnect</h1>
          <p className="mt-1 text-sm text-soil-500">
            Free forever for farmers. Always fair for consumers.
          </p>
        </div>
        <div className="relative mt-6">
          <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-forest-50" />}>
            <RegisterForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
