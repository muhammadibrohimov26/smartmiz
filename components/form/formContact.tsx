'use client'

import { contactSchema } from '@/lib/validation'
import { zodResolver } from '@hookform/resolvers/zod'
import { Send } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '../ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '../ui/form'
import { Input } from '../ui/input'


function ContactForm() {
	const [isLoading, setIsLoading] = useState(false)

	const form = useForm<z.infer<typeof contactSchema>>({
		resolver: zodResolver(contactSchema),
		defaultValues: {
	
			tel: '',
			name: '',
		},
	})

	function onSubmit(values: z.infer<typeof contactSchema>) {
		setIsLoading(true)
	
		const telegramBotId = process.env.NEXT_PUBLIC_TETELGRAM_BOT_API!
      
		
		const telegramChatId = process.env.NEXT_PUBLIC_TETELGRAM_CHAT_ID!
        console.log(telegramBotId);
        console.log(telegramChatId);
        
		const promise = fetch(
			`https://api.telegram.org/bot${telegramBotId}/sendMessage`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'cache-control': 'no-cache',
				},
				body: JSON.stringify({
					chat_id: telegramChatId,
					text: `Ism: ${values.name}:
telefon nomeri: ${values.tel}:`,
				}),
			}
		)
			.then(() => form.reset())
			.finally(() => setIsLoading(false))

		toast.promise(promise, {
			loading: 'Loading...',
			success: 'Successfully sent!',
			error: 'Something went wrong!',
		})
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-3'>
			
				<FormField
					control={form.control}
					name='tel'
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Input
								type='number'
									placeholder='Telefon nomer '
									disabled={isLoading}
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='name'
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Input
								
									placeholder='Ismingiz'
									disabled={isLoading}
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button
					className='w-fit'
					size={'lg'}
					type='submit'
					disabled={isLoading}
				>
					<span>Send</span>
					<Send className='w-4 h-4 ml-2' />
				</Button>
			</form>
		</Form>
	)
}

export default ContactForm