import type { Metadata } from "next";
import { VT323 } from "next/font/google";
import "./globals.css";

const vt323 = VT323({ weight: "400", subsets: ["latin"], variable: "--font-pixel" });

export const metadata: Metadata = {
  title: "Archive",
  description: "A private archive of Hedi Slimane's work at Dior Homme and Saint Laurent.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full ${vt323.variable}`}>
      <body className="min-h-full flex flex-col text-black">
        {children}
      </body>
    </html>
  );
}
