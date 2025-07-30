import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import  Header  from "./components/header";
import { CartProvider } from "./context/CartContext";
import { SidebarNavbar } from "./components/SidebarNavbar";
import ClothesBanner from "./components/ClothesBanner";
import Footer from "./components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "Kaze",
  description: "Premium clothing brand",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
  <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>

        <link
          href="https://fonts.googleapis.com/css2?family=Kaisei+Decol&family=Klee+One&family=Mochiy+Pop+One&family=Reggae+One&family=RocknRoll+One&family=Sawarabi+Mincho&family=Yomogi&family=Yuji+Boku&display=swap"
          rel="stylesheet"
        />

      </head>
      <body className="bg-white text-black">

        <CartProvider>
          <Header/>
          <SidebarNavbar/>
          <ClothesBanner/>
          {children}
          <Footer/>
        </CartProvider>
      </body>
    </html>
  );
}
