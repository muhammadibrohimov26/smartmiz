'use client'

import FormContact from '@/components/form/formContact'
import { Suspense, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Building2, ChevronDown, Clock, ExternalLink, GraduationCap, Headphones, Map as MapIcon, MapPin, MessageSquare, Phone } from 'lucide-react'
import { branches } from '@/constants'
import { useTranslation } from '@/context/LanguageContext'
import { Price } from '@/types'

const PHONE = { href: 'tel:+998732441333', label: '+998 73 244 13 33' }
const MAP_EMBED = "https://maps.google.com/maps?q=Smartmiz%20O'quv%20Markazi,%20Qomus%20ko'chasi,%20Farg'ona&t=&z=16&ie=UTF8&iwloc=&output=embed"
const MAP_LINK = "https://maps.google.com/?q=Smartmiz%20O'quv%20Markazi,%20Qomus%20ko'chasi,%20Farg'ona"

// Contact page (design): hero · branches · form + contact list · map · FAQ · features
function ContactContent({ courses }: { courses: Price[] }) {
	const { t } = useTranslation()
	const [openFaq, setOpenFaq] = useState<number | null>(null)
	const faqs = [1, 2, 3].map((n) => ({ q: t(`cfaq${n}Q`), a: t(`cfaq${n}A`) }))
	const houses = branches.map((b) => b.house)
	const allHouses = `${houses.slice(0, -1).join(', ')} ${t('andWord')} ${houses[houses.length - 1]}`

	return (
		<div className='contact-v2'>
			{/* HERO */}
			<div className='home-hero'>
				<div className='home-hero__inner'>
					<div className='home-hero__text'>
						<h1 className='home-hero__title'>
							<span className='block'>{t('contactHeroTitle1')}</span>
							<span className='home-hero__accent'>
								{t('contactHeroTitle2')}
								<svg className='home-hero__swoosh' viewBox='0 0 200 18' preserveAspectRatio='none' aria-hidden='true'>
									<path d='M3 14 C 50 4, 120 1, 197 9' />
								</svg>
							</span>
						</h1>
						<p className='home-hero__lead'>{t('contactHeroDesc')}</p>
						<div className='home-hero__actions'>
							<a href={PHONE.href} className='home-btn home-btn--solid' dir='ltr'>
								<Phone className='w-5 h-5' />
								{PHONE.label}
							</a>
							<a href='#contact-form' className='home-btn home-btn--outline'>
								<MessageSquare className='w-5 h-5 text-[#e0a106]' />
								{t('contactSendRequest')}
							</a>
						</div>
					</div>
					<div className='home-hero__photo'>
						<div className='home-hero__photo-frame'>
							<Image src='/img/contact-hero.webp' alt='Smartmiz' fill priority sizes='(min-width: 1024px) 55vw, 100vw' className='object-cover' />
						</div>
					</div>
				</div>
			</div>

			{/* BRANCHES */}
			<section className='pt-14 pb-6'>
				<div className='sec-head'>
					<h2 className='sec-head__title'>{t('branchesHeading')}</h2>
					<p className='sec-head__lead'>{t('branchesLead')}</p>
				</div>
				<div className='grid gap-5 lg:grid-cols-2'>
					{branches.map((b) => (
						<div key={b.house} data-reveal className='branch-big'>
							<div className='branch-big__photo' aria-hidden='true'>
								<Building2 className='w-12 h-12' strokeWidth={1.4} />
								<span>SMARTMIZ</span>
							</div>
							<div className='branch-big__body'>
								<p className='branch-big__name'><MapPin className='w-5 h-5' />{t('branchName')}</p>
								<p className='branch-big__line'><MapPin className='w-4 h-4' />{t('branchStreet', { house: b.house })}</p>
								<p className='branch-big__line'><Phone className='w-4 h-4' /><a href={PHONE.href} dir='ltr' className='hover:underline'>{PHONE.label}</a></p>
								<p className='branch-big__line'><Clock className='w-4 h-4' />{t('footerHours')}</p>
								<div className='branch-big__actions'>
									<a href={PHONE.href} className='branch-card__call'><Phone className='w-4 h-4' />{t('navContact')}</a>
									<a href={b.mapUrl} target='_blank' rel='noopener noreferrer' className='branch-big__map'><MapIcon className='w-4 h-4' />{t('branchOnMap')}</a>
								</div>
							</div>
						</div>
					))}
				</div>
			</section>

			{/* FORM + CONTACT LIST */}
			<section className='grid gap-5 lg:grid-cols-[1.4fr_1fr] py-8'>
				<div id='contact-form' className='contact-card contact-card--form scroll-mt-28'>
					<h2 className='contact-card__title'>{t('contactFormHeading')}</h2>
					<p className='contact-card__lead'>{t('contactFormLead')}</p>
					<Suspense fallback={<div>{t('loading')}</div>}>
						<FormContact courses={courses} bare />
					</Suspense>
				</div>
				<div className='contact-card'>
					<h2 className='contact-card__title contact-card__title--bar'>{t('footerContactTitle')}</h2>
					<p className='contact-card__lead'>{t('contactInfoLead')}</p>
					<div className='space-y-3'>
						<a href={PHONE.href} className='contact-info'>
							<span className='contact-info__icon'><Phone className='w-5 h-5' /></span>
							<span><span className='contact-info__label'>{t('infoPhone')}</span><span className='contact-info__value' dir='ltr'>{PHONE.label}</span></span>
						</a>
						<div className='contact-info'>
							<span className='contact-info__icon'><Clock className='w-5 h-5' /></span>
							<span><span className='contact-info__label'>{t('infoHours')}</span><span className='contact-info__value'>{t('footerHours')}</span></span>
						</div>
						<a href={MAP_LINK} target='_blank' rel='noopener noreferrer' className='contact-info'>
							<span className='contact-info__icon'><MapPin className='w-5 h-5' /></span>
							<span><span className='contact-info__label'>{t('infoBranches')}</span><span className='contact-info__value'>{t('footerAddressAll', { houses: allHouses })}</span></span>
						</a>
					</div>
				</div>
			</section>

			{/* MAP */}
			<section className='grid gap-6 lg:grid-cols-[1fr_2.2fr] items-center py-8'>
				<div>
					<h2 className='sec-head__title' style={{ fontSize: 'clamp(1.8rem,3vw,2.4rem)' }}>{t('mapHeading')}</h2>
					<p className='mt-3 mb-5 text-zinc-600 dark:text-zinc-400 ps-7'>{t('mapLead')}</p>
					<a href={MAP_LINK} target='_blank' rel='noopener noreferrer' className='contact-map-btn ms-7'>
						<MapIcon className='w-4 h-4' />{t('mapOpen')}<ExternalLink className='w-4 h-4' />
					</a>
				</div>
				<div className='contact-map'>
					<iframe src={MAP_EMBED} width='100%' height='100%' style={{ border: 0 }} allowFullScreen loading='lazy' referrerPolicy='no-referrer-when-downgrade' title={t('mapHeading')} />
				</div>
			</section>

			{/* FAQ */}
			<section className='faq-row'>
				<div>
					<h2 className='sec-head__title faq-row__title'>{t('faqHeading')}</h2>
					<p className='mt-3 mb-5 ps-7 text-zinc-600 dark:text-zinc-400'>{t('contactFaqLead')}</p>
					<Link href='/#faq' className='course-show-all ms-7'>{t('faqAll')}<ArrowRight className='w-4 h-4 rtl:rotate-180' /></Link>
				</div>
				<div className='space-y-3 min-w-0'>
					{faqs.map((f, i) => {
						const open = openFaq === i
						return (
							<div key={i} className={`faq-item ${open ? 'is-open' : ''}`}>
								<button onClick={() => setOpenFaq(open ? null : i)} aria-expanded={open} className='w-full flex items-center justify-between gap-3 px-5 py-3.5 text-start font-bold text-zinc-900 dark:text-white'>
									{f.q}
									<ChevronDown className={`w-5 h-5 shrink-0 transition-transform ${open ? 'rotate-180 text-[#e0a106]' : 'text-zinc-400'}`} />
								</button>
								<div className={`grid transition-all duration-300 ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
									<div className='overflow-hidden'>
										<p className='px-5 pb-4 text-zinc-600 dark:text-zinc-300 leading-relaxed'>{f.a}</p>
									</div>
								</div>
							</div>
						)
					})}
				</div>
			</section>

			{/* FEATURES */}
			<section className='contact-features'>
				{[
					{ icon: <Headphones className='w-7 h-7' />, title: t('featFastTitle'), desc: t('featFastDesc') },
					{ icon: <MapPin className='w-7 h-7' />, title: t('featPlaceTitle'), desc: t('featPlaceDesc') },
					{ icon: <GraduationCap className='w-7 h-7' />, title: t('featInfoTitle'), desc: t('featInfoDesc') },
				].map((f) => (
					<div key={f.title} className='contact-feature'>
						<span className='contact-feature__icon'>{f.icon}</span>
						<span><span className='block font-bold text-zinc-900 dark:text-white'>{f.title}</span><span className='block text-sm text-zinc-600 dark:text-zinc-400'>{f.desc}</span></span>
					</div>
				))}
			</section>
		</div>
	)
}

export default ContactContent
