import { Metadata } from 'next'
import { getCourses } from '@/lib/data'
import ContactContent from './_components/contactContent'

export const metadata: Metadata = {
	title: "Bog'lanish - Smartmiz",
	description: "Smartmiz o'quv markazi bilan bog'lanish uchun biz bilan telefon yoki e-mail orqali aloqa qiling.",
}

// Re-rendered on demand when a course is changed in the admin panel
export const revalidate = 3600

async function ContactPage() {
	const courses = await getCourses()
	return <ContactContent courses={courses} />
}

export default ContactPage
