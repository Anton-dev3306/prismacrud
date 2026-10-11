import type { Metadata } from "next";
import { Heebo, Lekton } from "next/font/google";
import "./globals.css";

const heebo = Heebo({
  subsets: ["latin"],
  variable: "--font-heebo",
  weight: ["400", "500", "700"],
});

const lekton = Lekton({
  subsets: ["latin"],
  variable: "--font-lekton",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Mi blog · Comunidad",
  description: "Blog de tecnología y desarrollo de software.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${heebo.variable} ${lekton.variable}`} suppressHydrationWarning>
      <body className="bg-[#F8FAFC] text-[#0F172A] font-sans antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}