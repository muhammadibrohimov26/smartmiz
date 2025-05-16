import FormContact from '@/components/form/formContact'

import { Dot, Home, Phone } from 'lucide-react'
import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
	title: "Bog'lanish - Smartmiz",
	description: "Smartmiz o'quv markazi bilan bog'lanish uchun biz bilan telefon yoki e-mail orqali aloqa qiling.",
  }
  

function ContactPage() {
	return (
		<div className='max-w-6xl mx-auto mb-3  h-[100%] md:mb-36'>
			<div className='relative min-h-[19vh] flex items-center justify-start flex-col mt-24'>
				<h2 className='text-center text-4xl section-title font-creteRound mt-2'>
					<span>Contact</span>
				</h2>

				<div className='flex gap-1 items-center mt-4'>
					<Home className='w-4 h-4' />
					<Link
						href={'/'}
						className='opacity-90 hover:underline hover:opacity-100'
					>
						Home
					</Link>
					<Dot />
					<p className='text-muted-foreground'>Contact</p>
				</div>
			</div>

			<div className='grid grid-cols-2 max-md:grid-cols-1 gap-4 '>
				<div className='flex flex-col'>
					<h1 className='text-4xl font-creteRound text-center md:text-left'>Contact Smartmiz</h1>
					<p className='mt-2 text-muted-foreground text-center md:text-left'>
						Kusrlarimiz haqida ko`proq malumot olish uchun 
						telefon raqamizni qoldring
					</p>

					<div className='mt-12 flex items-center gap-3'>
						<Phone className='w-4 h-4' />
						<p className='text-sm'> <a href="tel:+998732441333">+998 73 244 13 33</a> </p>
					</div>
					<div className='flex items-center gap-3 mt-2'>
						<Phone className='w-4 h-4' />
						<p className='text-sm'> <a href="tel:+998732440099">+998 73 244 00 99</a> </p>
					</div>
				</div>

				<div>
					<h1 className='text-4xl font-creteRound mb-4'>Contact form</h1>
				<FormContact/>
				</div>
			</div>
			
		</div>
		
	)
}

export default ContactPage
