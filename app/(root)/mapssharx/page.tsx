import { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'
import MapsReviewContent from './_components/mapsReviewContent'

export const metadata: Metadata = pageMetadata({
	title: "Smartmizni baholang — Google va Yandex xaritalari",
	description:
		"Smartmiz oʻquv markazi (Fargʻona) haqida Google yoki Yandex xaritasida baho va sharh qoldiring.",
	path: "/mapssharx",
	keywords: ["Smartmiz sharh", "Smartmiz baholash", "Smartmiz Google", "Smartmiz Yandex"],
})

// Short page for QR codes / Telegram: two buttons to leave a review on Google Maps and Yandex Maps
function MapsReviewPage() {
	return <MapsReviewContent />
}

export default MapsReviewPage
