import { z } from "zod"

// Uzbek phone numbers: 9 digits (90 123 45 67) or 12 with the country code (998 90 123 45 67)
export function normalizeUzPhone(input: string): string | null {
    let digits = input.replace(/\D/g, "")
    if (digits.length === 12 && digits.startsWith("998")) digits = digits.slice(3)
    if (digits.length !== 9) return null
    return `+998 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7)}`
}

// Error messages are dictionary keys, translated in the contact form.
export const contactSchema = z.object({
    name: z.string().trim().min(2, "errName").max(100, "errName"),
    tel: z.string().trim().refine((v) => normalizeUzPhone(v) !== null, "errPhone"),
    kurs: z.string().trim().min(1, "errCourse").max(120, "errCourse"),
  })
