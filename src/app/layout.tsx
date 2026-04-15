import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CityProvider } from "@/context/CityContext";
// import { CitySelectionModal } from "@/components/CitySelectionModal";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SINAH Institute of Nursing & Allied Health Sciences",
  description: "Excellence in healthcare education. Join Pakistan's leading nursing institute for BSN, Post RN, and Allied Health programs.",
  keywords: ["Nursing", "Education", "Healthcare", "Karachi", "BSN", "LHV", "Medical Lab Tech"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased selection:bg-secondary/30`}>
        <CityProvider>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
          {/* <CitySelectionModal /> */}
        </CityProvider>
      </body>
    </html>
  );
}
