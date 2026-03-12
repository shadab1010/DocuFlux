import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";

export const metadata: Metadata = {
  title: "DocuFlux - Professional PDF Tools & Document Management",
  description: "Transform, convert, and manage your PDF documents with ease. Free online PDF tools for merging, splitting, converting, and more.",
  icons: {
    icon: '/logo_new.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-JX3W1CFZTL"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-JX3W1CFZTL');
          `}
        </Script>
      </head>
      <body className="antialiased font-sans text-gray-900 bg-[#FFFCF5]" suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
