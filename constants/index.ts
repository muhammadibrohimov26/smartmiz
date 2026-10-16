import { Contact2, Newspaper, Home } from "lucide-react";


export const navLink = [
    { name: 'Home', route: '/', icon: Home, translationKey: 'navHome' },
    { name: 'News', route: '/news', icon: Newspaper, translationKey: 'navNews' },
    { name: 'Contact', route: '/contact', icon: Contact2, translationKey: 'navContact' },
]

// Smartmiz branches (house numbers on Qomus street, Fergana)
export const branches = [
    { house: "44", mapUrl: "https://maps.google.com/?q=Smartmiz%20O'quv%20Markazi,%20Qomus%20ko'chasi%2044,%20Farg'ona" },
    { house: "53", mapUrl: "https://maps.google.com/?q=Smartmiz%20O'quv%20Markazi,%20Qomus%20ko'chasi%2053,%20Farg'ona" },
]
