import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ChildProps } from "@/types";
import { ThemeProvider } from "@/components/providers/theme-providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Smartmiz ",
  description: "Smartmiz o'quv markaziga hush kelibsiz",
};

 function RootLayout({children}: ChildProps) {
  return (
    <html lang="en" suppressHydrationWarning>
    <body className={` owerflow-x-hidden`  }>
      <ThemeProvider attribute="class"
          defaultTheme="dark" // Boshqacha rejimda ishga tushirilmasligi uchun dark qilib qo'ying
          forcedTheme="dark"  // Dark mode-ni majburlash
          disableTransitionOnChange >
            {children}
      </ThemeProvider>
     </body>
  </html>
  );
}
export default RootLayout