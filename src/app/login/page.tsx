'use client'

import { redirect, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Login() {
	const searchParams = useSearchParams()
	const code = searchParams.get('code')
	const [hostname, setHostname] = useState('')
	const [protocol, setProtocol] = useState('')

	useEffect(() => {
		const access_token = window.localStorage.getItem('access_token')
		if (access_token) {
			redirect('/')
		}

		async function tokenGenerator(code: string) {
			try {
				const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_PROXY_URL}/api/tokens`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						code: code,
						redirect_url: window.location.hostname,
						redirect_url_protocol: window.location.protocol,
					}),
				})

				const data = await res.json()

				window.localStorage.setItem('username', data.username)
				window.localStorage.setItem('access_token', data.access_token)
				window.localStorage.setItem('refresh_token', data.refresh_token)
				window.localStorage.setItem('token_type', data.token_type)

				window.location.href = '/'
			} catch (error) {
				console.log(error)
			}
		}

		if (code) {
			tokenGenerator(code)
		}

		setHostname(window.location.hostname)
		console.log(window.location.hostname)
		setProtocol(window.location.protocol)
		console.log(window.location.protocol)
	}, [code])

	return (
		<div className=''>
			<button
				className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
				onClick={() => {
					return redirect(
						`https://${process.env.NEXT_PUBLIC_SNOWFLAKE_ACCOUNT_URL}/oauth/authorize?response_type=code&client_id=${encodeURIComponent(process.env.NEXT_PUBLIC_SNOWFLAKE_CLIENT_ID!)}&redirect_uri=${protocol}//${hostname}/login`,
					)
				}}>
				Login
			</button>
		</div>
	)
}
