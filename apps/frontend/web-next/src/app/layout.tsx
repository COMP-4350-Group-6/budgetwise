import "./globals.css";
import type { ReactNode } from "react";
import { Providers } from "./providers";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
