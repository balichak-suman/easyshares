import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EasyShares - Secure Code & File Sharing",
  description: "Share code snippets and files securely with optional password protection and expiration dates.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-neutral-950 text-neutral-100 min-h-screen flex flex-col`}
      >
        {children}
        <footer className="w-full py-4 mt-auto text-center text-sm text-neutral-400 border-t border-neutral-800 bg-neutral-950">
          <span className="inline-block animate-gradient bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold">
            Developed by Balichak Suman
          </span>
          <style>{`
            @keyframes gradientMove {
              0% { background-position: 0% 50%; }
              100% { background-position: 100% 50%; }
            }
            .animate-gradient {
              background-size: 200% 200%;
              animation: gradientMove 3s linear infinite alternate;
            }
          `}</style>
        </footer>
      </body>
    </html>
  );
}
