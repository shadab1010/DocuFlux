import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";

export const metadata: Metadata = {
  title: "DocuFlux - Professional PDF Tools & Document Management",
  description: "Transform, convert, and manage your PDF documents with ease. Free online PDF tools for merging, splitting, converting, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased font-sans text-gray-900 bg-[#FFFCF5]">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
