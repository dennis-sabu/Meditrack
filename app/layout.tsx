import type { Metadata } from "next";
import { Figtree, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ChatWidgetContainer from "./components/ChatWidgetContainer";
import ToasterProvider from "./components/ToasterProvider";
import Providers from "./(auth)/signin/Providers";


const geistMono = Figtree({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Meditrack",
  description: "A Health Platform You Can Trust",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistMono.className} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
        <ToasterProvider />
        {/* Include the ChatWidget at the application root level */}
        <ChatWidgetContainer />
      </body>
    </html>
  );
}
