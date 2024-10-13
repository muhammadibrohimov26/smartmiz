import { z } from "zod"

export const contactSchema = z.object({
    tel: z.string().min(9).max(50),
    name: z.string().min(4),
    kurs: z.string(),


  })