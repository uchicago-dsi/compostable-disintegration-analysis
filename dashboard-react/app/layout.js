import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// TODO: maybe force light mode here — reevaluate after implementing DaisyUI components

export const metadata = {
  title: "Compostable Field Testing Analysis",
  description: "Disintegration Dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
