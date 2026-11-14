"use client";

import Link from "next/link";
import { Clock, Instagram, MapPin, Phone, Send, Youtube } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";
import { branches, navLink } from "@/constants";
import Logo from "@/components/shared/logo";

const phones = [
  { href: "tel:+998732441333", label: "+998 73 244 13 33" },
  { href: "tel:+998732440099", label: "+998 73 244 00 99" },
];

const socials = [
  { href: "https://t.me/Smartmiz", label: "Telegram", Icon: Send },
  { href: "https://www.instagram.com/smartmiz_fergana", label: "Instagram", Icon: Instagram },
  { href: "https://www.youtube.com/@smartmizoquvmarkazi7835", label: "YouTube", Icon: Youtube },
];

// Logo and tagline · menu · contacts · social links, on a soft green wave
function Footer() {
  const { t } = useTranslation();
  const houses = branches.map((b) => b.house);
  const allHouses = houses.length > 1 ? `${houses.slice(0, -1).join(", ")} ${t("andWord")} ${houses[houses.length - 1]}` : houses[0];

  return (
    <footer className="site-footer site-footer--new">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <Link href="/" aria-label="Smartmiz">
            <Logo className="h-8 text-zinc-950 dark:text-white" />
          </Link>
          <p>{t("footerTagline")}</p>
        </div>

        <nav className="site-footer__nav" aria-label="Footer">
          {navLink.map((n) => (
            <Link key={n.route} href={n.route}>{t(n.translationKey || n.name)}</Link>
          ))}
        </nav>

        <div className="site-footer__contact">
          <p className="site-footer__heading">{t("footerContactTitle")}</p>
          <a href={branches[0].mapUrl} target="_blank" rel="noopener noreferrer" className="site-footer__line">
            <MapPin className="w-4 h-4 shrink-0" />
            <span>{t("footerAddressAll", { houses: allHouses })}</span>
          </a>
          <p className="site-footer__line">
            <Phone className="w-4 h-4 shrink-0" />
            <span className="flex flex-wrap gap-x-3">
              {phones.map((p) => (
                <a key={p.href} href={p.href} dir="ltr" className="whitespace-nowrap hover:underline">{p.label}</a>
              ))}
            </span>
          </p>
          <p className="site-footer__line">
            <Clock className="w-4 h-4 shrink-0" />
            <span>{t("footerHours")}</span>
          </p>
        </div>

        <div className="site-footer__social">
          {socials.map(({ href, label, Icon }) => (
            <a key={href} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="site-footer__icon">
              <Icon className="w-5 h-5" />
            </a>
          ))}
        </div>
      </div>
      <p className="site-footer__copy">© {new Date().getFullYear()} {t("footerRights")}</p>
    </footer>
  );
}

export default Footer;
