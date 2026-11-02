import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "sonner";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin", "latin-ext"] });

export const metadata: Metadata = {
  title: { default: "Dvaput – polovna odjeća", template: "%s · Dvaput" },
  description: "Kupi i prodaj polovnu odjeću brzo i sigurno. Za resellere i sve koji žele da njihova odjeća dobije drugi život.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="bs" className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster position="bottom-center" toastOptions={{ className: "!rounded-none" }} />
      </body>
    </html>
  );
}
