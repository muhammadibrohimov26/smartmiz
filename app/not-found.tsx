import { Metadata } from "next";
import NotFoundContent from "./not-found-content";

export const metadata: Metadata = {
  title: "Sahifa topilmadi",
  robots: { index: false },
};

export default function NotFound() {
  return <NotFoundContent />;
}
