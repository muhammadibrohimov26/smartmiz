import { Metadata } from "next";
import AboutContent from "../_components/aboutContent";

export const metadata: Metadata = {
  title: "Biz haqimizda - Smartmiz o'quv markazi",
  description: "Smartmiz o'quv markazi tarixi, yutuqlari va o'quv faoliyati haqida batafsil ma'lumot oling. 10 yildan ortiq ta'lim tajribasi va 11,000 dan ortiq muvaffaqiyatli bitiruvchilar.",
  keywords: "Smartmiz haqida, Smartmiz tarixi, Smartmiz o'quv markazi jamoasi, Farg'ona chet tillari maktabi, Smartmiz yutuqlari, o'quv markazi tarixi, 10 yillik tajriba, Farg'ona o'quv markazlari"
};

function AboutPage() {
  return <AboutContent />;
}

export default AboutPage;