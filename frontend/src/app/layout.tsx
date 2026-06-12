import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { AppProvider } from "@/context/AppContext";
import { DemoControlCenter } from "@/components/DemoControlCenter";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MOLE — Nepal B2B Industrial Waste & Resource Exchange",
  description: "AI-powered circular resource marketplace connecting waste generators with recyclers and manufacturing plants in Nepal.",
  keywords: ["circular economy", "waste exchange", "nepal recyclers", "industrial symbiosis", "esg nepal", "kathmandu recycling"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiased font-sans`}
    >
      <body className="min-h-full flex flex-col bg-[#F8FAF8] text-[#0F172A]">
        <AppProvider>
          {/* Top Demo simulation bar */}
          <DemoControlCenter />
          
          {/* Header navigation bar */}
          <Navbar />
          
          {/* Main workspace area */}
          <main className="flex-grow flex flex-col">
            {children}
          </main>
          
          {/* Platform Footer */}
          <footer className="bg-white border-t border-gray-205 py-8 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-700">MOLE Nepal</span>
                <span>© {new Date().getFullYear()}. All rights reserved.</span>
              </div>
              <div className="flex gap-4">
                <a href="#" className="hover:text-[#1D6B44] transition-colors">Terms of Exchange</a>
                <a href="#" className="hover:text-[#1D6B44] transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-[#1D6B44] transition-colors">ESG Standard Guidelines</a>
                <a href="#" className="hover:text-[#1D6B44] transition-colors">Developer API</a>
              </div>
              <div>
                <span className="text-emerald-700 font-semibold bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                  🇳🇵 Patan Industrial Estate, Lalitpur
                </span>
              </div>
            </div>
          </footer>
        </AppProvider>
      </body>
    </html>
  );
}
