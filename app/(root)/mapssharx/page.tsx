import { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'
import MapsReviewContent from './_components/mapsReviewContent'

export const metadata: Metadata = pageMetadata({
	title: "Smartmizni baholang — Google, Yandex va Golden Pages",
	description:
		"Smartmiz oʻquv markazi (Fargʻona) haqida Google, Yandex yoki Golden Pagesʼda baho va sharh qoldiring.",
	path: "/mapssharx",
	keywords: ["Smartmiz sharh", "Smartmiz baholash", "Smartmiz Google", "Smartmiz Yandex", "Smartmiz Golden Pages"],
})

// Short page for QR codes / Telegram: buttons to leave a review on Google Maps, Yandex Maps and Golden Pages
function MapsReviewPage() {
	return <MapsReviewContent />
}

export default MapsReviewPage
