"use client";

import { useTranslation } from "@/context/LanguageContext";

function Footer() {
  const { t } = useTranslation();

  return (
    <div className="w-full py-8 border-t border-gray-200 dark:border-zinc-800 bg-transparent mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="font-bold bw-text uppercase tracking-widest text-sm text-gray-500 dark:text-gray-400">
          <p>© {new Date().getFullYear()} {t("footerRights")}</p>
        </div>
        <div className="flex gap-6">
          <a target='_blank' href="https://www.instagram.com/smartmiz_fergana" className="hover:scale-110 hover:brightness-110 transition-transform">
            <img src="https://idyllic-sprite-7cad0a.netlify.app/img/instagram.png" alt="Instagram" className="w-6 h-6 grayscale hover:grayscale-0" />
          </a>
          <a target='_blank' href="https://t.me/Smartmiz" className="hover:scale-110 hover:brightness-110 transition-transform">
            <img src="https://idyllic-sprite-7cad0a.netlify.app/img/telegram.png" alt="Telegram" className="w-6 h-6 grayscale hover:grayscale-0" />
          </a>
          <a target='_blank' href="https://www.youtube.com/@smartmizoquvmarkazi7835" className="hover:scale-110 hover:brightness-110 transition-transform">
             <img src="https://idyllic-sprite-7cad0a.netlify.app/img/youtube.png" alt="Youtube" className="w-6 h-6 grayscale hover:grayscale-0" />
          </a>
        </div>
      </div>
    </div>
  )
}

export default Footer
