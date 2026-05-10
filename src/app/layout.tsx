import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col text-black antialiased">
        {children}
      </body>
    </html>
  );
}
