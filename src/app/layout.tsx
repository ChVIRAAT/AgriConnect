import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: {
    default: "AgriConnect – Farm to Consumer",
    template: "%s · AgriConnect",
  },
  description:
    "Connect directly with farmers, discover fresh crops, compare prices, and buy directly from the source. A fair digital mandi without middlemen.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <Navbar
          user={
            user
              ? { id: user.id, name: user.name, role: user.role, avatar: user.avatar }
              : null
          }
        />
        <main className="min-h-[60vh]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
