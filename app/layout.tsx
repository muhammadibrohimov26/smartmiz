import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ChildProps } from "@/types";
import { ThemeProvider } from "@/components/providers/theme-providers";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {



  title: "Smartmiz ",
  description: "Smartmiz o'quv markaziga hush kelibsiz",

  authors: [{ name: 'Muhammad ibrohimov', url: 'https://smartmiz.uz' }],
	icons: { icon: '/SMARTMIZ.jpg' },
	keywords:
		"Muhammad ibrohimov, Doniyor tohirov, dasturlash kurslari, dasturlashga oid darslar, reactjs uzbek tilida, vuejs uzbek tilida, redux uzbek tilida, smart, smartmiz o'quv markazi, ingliz tili, rus tili, cefr, smartmiz javascript, smartmiz  yorqin kelajak, javascript, reactjs, vuejs, koreys tili darslari, reactjs darslari, ielts , c1 rus tili, turk tili, topic koreys tili, rus tili o'zbek tilida, koreys tili darslari, javascript darslari o'zbek tilida, dasturash darslari o'zbek tilida, dasturlashni o'rganish, dasturlash, IT loyihalar o'zbek tilida",

    openGraph: {
      title: "Smartmiz",
      description:
        "Smartmiz o'quv markaziga hush kelibsiz",
      type: 'website',
      url: 'https://smartmiz.uz',
      locale: 'en_EN',
      images: 'https://idyllic-sprite-7cad0a.netlify.app/img/bg.png',
      countryName: 'Uzbekistan',
      siteName: 'Smartmiz',
      emails: 'muhammadibrohimov0306@gmail.com', 
    },

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
            <Toaster position="top-center" />
      </ThemeProvider>
     </body>
  </html>
  );
}
export default RootLayout