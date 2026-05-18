import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ChildProps } from "@/types";
import { ThemeProvider } from "@/components/providers/theme-providers";
import { Toaster } from "@/components/ui/sonner";
import { LanguageProvider } from "@/context/LanguageContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {



  title: "Smartmiz - Chet Tillari va Kompyuter Kurslari",
  description: "Smartmiz o'quv markaziga xush kelibsiz. Ingliz tili, rus tili, koreys tili, arab tili, turk tili va kompyuter savodxonligi bo'yicha yuqori sifatli ta'lim beramiz. Kelajagingizni tillar va kompyuter savodxonligi bilan quring!",


  authors: [{ name: 'Muhammad ibrohimov', url: 'https://smartmiz.uz' }],
	icons: { icon: '/SMARTMIZ.jpg' },
	keywords: "Muhammad ibrohimov, Doniyor tohirov, dasturlash kurslari, dasturlash darslari, reactjs uzbek tilida, EPS topik uzbek tilida, redux uzbek tilida, Smartmiz o'quv markazi, ingliz tili kurslari, rus tili kurslari, CEFR, javascript darslari, IT kurslari o'zbek tilida, koreys tili darslari, IELTS, C1 rus tili, turk tili, TOPIK koreys tili, IT loyihalar o'zbek tilida",


    openGraph: {
      title: "Smartmiz - Chet Tillari va Kompyuter Kurslari",
      description: "Smartmiz o'quv markaziga xush kelibsiz. Ingliz tili, rus tili, koreys tili, arab tili, turk tili va kompyuter savodxonligi bo'yicha yuqori sifatli ta'lim beramiz.",
      type: 'website',
      url: 'https://smartmiz.uz',
      locale: 'uz_UZ',
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
      <LanguageProvider>
        <ThemeProvider attribute="class"
            defaultTheme="dark" 
            disableTransitionOnChange >
              {children}
              <Toaster position="top-center" />
        </ThemeProvider>
      </LanguageProvider>
     </body>
  </html>
  );
}
export default RootLayout