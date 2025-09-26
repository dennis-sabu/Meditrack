import type { Metadata } from "next";
import "./globals.css";
import { Figtree } from "next/font/google";
// import { TRPCReactProvider } from "@/utils/react";
import { Toaster } from "sonner";
import { TRPCReactProvider } from "@/utils/react";
import { Providers } from "@/components/cook/providers";

const geistSans = Figtree({
  // variable: "--font-geist-sans",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MedApp Login",
  description: "Employer Medical Portal - Login",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.className} antialiased`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
