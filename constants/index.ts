import { Contact2, Newspaper, Home, MessageSquareQuote } from "lucide-react";


export const navLink = [
    { name: 'Home', route: '/', icon: Home, translationKey: 'navHome' },
    { name: 'News', route: '/news', icon: Newspaper, translationKey: 'navNews' },
    // Reviews section of the home page
    { name: 'Reviews', route: '/#reviews', icon: MessageSquareQuote, translationKey: 'navReviews' },
    { name: 'Contact', route: '/contact', icon: Contact2, translationKey: 'navContact' },
]

// Smartmiz's own Google Business Profile listing ("Smartmiz o'quv markazi Fergana",
// Qomus 44). Pinned by its map ID so the links never land on the unrelated
// "Smartmiz" listing nearby. embedUrl comes from Maps → Share → Embed a map.
export const googlePlace = {
    mapUrl: "https://www.google.com/maps?cid=11004743925649963491",
    embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2528.5995088715117!2d71.7903812!3d40.385186499999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38bb8361116aed3f%3A0x98b8b44b7480f9e3!2sSmartmiz%20o'quv%20markazi%20Fergana!5e0!3m2!1suz!2suz!4v1795074037313!5m2!1suz!2suz",
    reviewUrl: "https://g.page/r/CeP5gHRLtLiYEBM/review",
}

// Smartmiz branches (house numbers on Qomus street, Fergana)
export const branches = [
    { house: "44", mapUrl: googlePlace.mapUrl },
    { house: "53", mapUrl: "https://maps.google.com/?q=Smartmiz%20O'quv%20Markazi,%20Qomus%20ko'chasi%2053,%20Farg'ona" },
]
