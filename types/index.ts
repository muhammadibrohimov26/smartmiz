export interface ChildProps {
    children: React.ReactNode;
}

export interface Price {
    id?: string
    courseName: string
    coursePrice: number
    courseChegirma: number
    courseTime: string
    courseType: string
    chegirma: string
    image: string
}

export interface NewsItem {
    id: string
    name: string
    course: string
    result: string
    score: string
    image: string
    date: string
    quote: string
    status: ReviewStatus
    // Sent through the Telegram bot: link to the channel post, video/voice kind
    telegramLink?: string
    media?: TelegramMediaKind
}

export type TelegramMediaKind = "video" | "video_note" | "voice" | "audio"

export type LeadStatus = "new" | "contacted"

export interface Lead {
    id: string
    name: string
    tel: string
    kurs: string
    status: LeadStatus
    createdAt: string
}

export interface SiteSettings {
    studentCount: number
    aboutVideoUrl: string
    aboutVideoImage: string
}

export type ReviewStatus = "pending" | "approved" | "hidden"

export interface Review {
    id: string
    name: string
    photo: string
    rating: number
    text: string
    status: ReviewStatus
    updatedAt: string
    telegramLink?: string
    media?: TelegramMediaKind
}
