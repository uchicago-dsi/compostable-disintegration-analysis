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
      <head>
        <script defer src="https://core-facility-umami.vercel.app/script.js" data-website-id="ed2c4773-0160-4311-a9b0-fd125f5f4a09"></script>
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
