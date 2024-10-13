import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Biz haqimizda - Smartmiz o'quv markazi",
  description:
    "Smartmiz o'quv markazi haqida to'liq ma'lumot. Bizning maqsadlarimiz, jamoamiz va ta'lim xizmatlarimiz haqida batafsil bilib oling.",
};

function About() {
  return (
    <div className="mt-28 container  h-[100%]  md:h-[71vh] mb-4 ">
      <h1 className="text-3xl mb-4 text-center">
        SMARTMIZ o‘quv markazi tarixi haqida. 2016 – 2024!{" "}
      </h1>
      <p className="text-center">
        🔥 «SMARTMIZ» o‘quv markazining 8 yillik faoliyati davomida turli
        qiyinchiliklar, jamoadagi insonlarning ketishi, to‘siqlar va muammolar
        bo‘ldi. Shunga qaramasdan SMARTMIZ katta yutuqlarga erishdi, 11 mingdan
        ziyod o‘quvchilarga ingliz tilidan taʼlim berdi. Koreys tili ✅ Rus tili 
        ✅ Ingliz tili ✅ Turk tili ✅ Arab tili ✅ Web dasturlash ✅ Kompyuter
        kursi ✅ Mental arifmetika kurslari mavjud ✅ Ushbu bosib o`tilgan 9
        yillik tarixi haqida sizlar uchun videorolik tayyorladik. o`quv
        markazimiz haqida video ko`rish uchun link ustiga bosing 
        <a target="_blank" href="https://www.instagram.com/tv/CazdM-nFCUF/?igsh=eWdscjR0OXMwcHEx" className="text-blue-700" >  👉 Link 👈 </a>
      </p>
    </div>
  );
}

export default About;
 