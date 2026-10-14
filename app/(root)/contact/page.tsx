import { Metadata } from 'next'
import { getCourses } from '@/lib/data'
import { pageMetadata } from '@/lib/seo'
import ContactContent from './_components/contactContent'

export const metadata: Metadata = pageMetadata({
	title: "Aloqa — Smartmiz oʻquv markazi, Fargʻona",
	description:
		"Smartmiz: Fargʻona, Qomus koʻchasi 44 va 53. Telefon: +998 73 244 13 33. Du–Sha 8:00–19:00. Kursga yoki bepul sinov darsiga yoziling.",
	path: "/contact",
	keywords: ["Smartmiz manzil", "Smartmiz telefon", "oʻquv markazi Fargʻona", "Qomus koʻchasi"],
})

// Re-rendered on demand when a course is changed in the admin panel
export const revalidate = 3600

async function ContactPage() {
	const courses = await getCourses()
	return <ContactContent courses={courses} />
}

export default ContactPage
