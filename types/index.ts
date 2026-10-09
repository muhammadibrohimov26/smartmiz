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
}

export type LeadStatus = "new" | "contacted"

export interface Lead {
    id: string
    name: string
    tel: string
    kurs: string
    status: LeadStatus
    createdAt: string
}
