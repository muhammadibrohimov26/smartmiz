import { z } from "zod"

// Error messages are dictionary keys, translated in the contact form.
export const contactSchema = z.object({
    tel: z.string().trim().min(9, "errPhone").max(50, "errPhone"),
    name: z.string().trim().min(2, "errName").max(100, "errName"),
    kurs: z.string().trim().min(1, "errCourse"),
  })
