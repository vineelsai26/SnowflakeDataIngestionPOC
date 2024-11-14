'use client'

import { redirect, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type Stage = {
	name: string
}

export default function Home() {
	const router = useRouter()

	const [stages, setStages] = useState<Stage[]>([])

	useEffect(() => {
		const access_token = window.localStorage.getItem('access_token')
		const refresh_token = window.localStorage.getItem('refresh_token')
		const token_type = window.localStorage.getItem('token_type')

		if (access_token && refresh_token && token_type) {
			console.log('token is valid')
		} else {
			console.log('token is invalid')
			redirect('/login')
		}

		async function getUserStages(access_token: string) {
			const response = await fetch(
				`https://${process.env.NEXT_PUBLIC_SNOWFLAKE_ACCOUNT_URL}/api/v2/databases/TEST_APP_2/schemas/TEST_SCHEMA/stages`,
				{
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${access_token}`,
						'X-Snowflake-Authorization-Token-Type': 'OAUTH',
					},
				}
			)
			if (response.status === 401) {
				const token_response = await fetch('/api/tokens', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						refresh_token: refresh_token,
						grant_type: 'refresh_token',
					}),
				})

				const token_data = await token_response.json()
                if (token_data.error){
                    console.log(token_data.error)
                    window.localStorage.removeItem('access_token')
                    window.localStorage.removeItem('refresh_token')
                    window.localStorage.removeItem('token_type')
                    window.localStorage.removeItem('username')
                    redirect('/login')
                }
				console.log(token_data)
				window.localStorage.setItem(
					'access_token',
					token_data.access_token
				)
			} else if (response.status === 200) {
				const data = await response.json()
				setStages(data)
				console.log(data)
			}
		}

		getUserStages(access_token)
	}, [])

	return (
		<div className=''>
			<div className='flex flex-col gap-4'>
				{stages.map((stage, index) => {
					return (
						<div key={index} className='flex gap-4 items-center'>
							<div
								className='flex-grow bg-slate-500'
								onClick={() =>
									router.push(`/stage/${stage.name}`)
								}>
								{stage.name}
							</div>
						</div>
					)
				})}
			</div>
		</div>
	)
}
