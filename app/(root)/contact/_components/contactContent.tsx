'use client'

import FormContact from '@/components/form/formContact'
import { Suspense } from 'react'
import { Dot, Home, Phone } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from '@/context/LanguageContext'

function ContactContent() {
	const { t } = useTranslation()

	return (
		<div className='max-w-6xl mx-auto mb-3 h-[100%] md:mb-36'>
			<div className='relative min-h-[19vh] flex items-center justify-start flex-col mt-24'>
				<h2 className='text-center text-4xl section-title font-creteRound mt-2'>
					<span>{t('contactTitle')}</span>
				</h2>

				<div className='flex gap-1 items-center mt-4'>
					<Home className='w-4 h-4' />
					<Link
						href={'/'}
						className='opacity-90 hover:underline hover:opacity-100'
					>
						{t('navHome')}
					</Link>
					<Dot />
					<p className='text-muted-foreground'>{t('contactTitle')}</p>
				</div>
			</div>

			<div className='grid grid-cols-2 max-md:grid-cols-1 gap-4 '>
				<div className='flex flex-col'>
					<h1 className='text-4xl font-creteRound text-center md:text-left'>{t('contactHeading')}</h1>
					<p className='mt-2 text-muted-foreground text-center md:text-left'>
						{t('contactDesc')}
					</p>

					<div className='mt-12 flex items-center gap-3'>
						<Phone className='w-4 h-4' />
						<p className='text-sm'> <a href="tel:+998732441333" dir='ltr'>+998 73 244 13 33</a> </p>
					</div>
					<div className='flex items-center gap-3 mt-2'>
						<Phone className='w-4 h-4' />
						<p className='text-sm'> <a href="tel:+998732440099" dir='ltr'>+998 73 244 00 99</a> </p>
					</div>
				</div>

				<div>
					<h1 className='text-4xl font-creteRound mb-4'>{t('contactFormTitle')}</h1>
					<Suspense fallback={<div>{t('loading')}</div>}>
						<FormContact/>
					</Suspense>
				</div>
			</div>

			{/* GOOGLE MAPS SECTION */}
			<div className='mt-16 md:mt-24'>
				<h2 className='text-3xl font-creteRound mb-6 text-center md:text-left'>{t('contactMapTitle')}</h2>
				<div className='w-full h-[450px] border-4 border-zinc-950 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)] bg-zinc-100 dark:bg-zinc-900'>
					<iframe
						src="https://maps.google.com/maps?q=Smartmiz%20O'quv%20Markazi,%20Qomus%20ko'chasi,%20Farg'ona&t=&z=16&ie=UTF8&iwloc=&output=embed"
						width="100%"
						height="100%"
						style={{ border: 0 }}
						allowFullScreen={true}
						loading="lazy"
						referrerPolicy="no-referrer-when-downgrade"
					></iframe>
				</div>
			</div>
		</div>
	)
}

export default ContactContent
