import { Metadata } from 'next'
import ContactContent from './_components/contactContent'

export const metadata: Metadata = {
	title: "Bog'lanish - Smartmiz",
	description: "Smartmiz o'quv markazi bilan bog'lanish uchun biz bilan telefon yoki e-mail orqali aloqa qiling.",
}

function ContactPage() {
	return <ContactContent />
}

export default ContactPage
