import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Providers } from "@/components/layout/Providers";

export const metadata: Metadata = {
  title: "BAN KAI | Multi-Agent AI Research & Execution Platform",
  description:
    "Autonomous Multi-Agent AI Research & Execution Platform transforming complex objectives into verified evidence, strategic roadmaps, and executed deliverables.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0c0d0e] text-[#f1f5f9] antialiased flex h-screen overflow-hidden">
        <Providers>
          <Sidebar />
          <div className="flex-1 flex flex-col h-screen overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto bg-[#0c0d0e]">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
