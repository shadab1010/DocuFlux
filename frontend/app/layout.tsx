import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
