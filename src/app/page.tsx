'use client'

import { redirect, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type Stage = {
	name: string
}

export default function Home() {
	const router = useRouter()

	const [stages, setStages] = useState<Stage[]>([])
	const [globalSearchOutput, setGlobalSearchOutput] = useState<string[]>([])
	const [globalSearchInput, setGlobalSearchInput] = useState<string>('')

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
				`https://${process.env.NEXT_PUBLIC_SNOWFLAKE_ACCOUNT_URL}/api/v2/databases/${process.env.NEXT_PUBLIC_SNOWFLAKE_DATABASE}/schemas/${process.env.NEXT_PUBLIC_SNOWFLAKE_SCHEMA}/stages`,
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
				const token_response = await fetch(
					`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tokens`,
					{
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							refresh_token: refresh_token,
							grant_type: 'refresh_token',
						}),
					}
				)

				const token_data = await token_response.json()
				if (token_data.error) {
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

	useEffect(() => {
		const access_token = window.localStorage.getItem('access_token')

		async function searchUserStagesData(access_token: string) {
			let get_all_stage_dirs_query = `SELECT * FROM DIRECTORY('@"OAUTH_POC"."TEST_SCHEMA".${stages[0].name}')`
			for (let i = 1; i < stages.length; i++) {
				get_all_stage_dirs_query += ` UNION SELECT * FROM DIRECTORY('@"OAUTH_POC"."TEST_SCHEMA".${stages[i].name}')`
			}
			let search_query = `SELECT * FROM (${get_all_stage_dirs_query}) WHERE RELATIVE_PATH RLIKE '.*${globalSearchInput}.*'`

			const response = await fetch(
				`https://${process.env.NEXT_PUBLIC_SNOWFLAKE_ACCOUNT_URL}/api/v2/statements`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${access_token}`,
						'X-Snowflake-Authorization-Token-Type': 'OAUTH',
					},
					body: JSON.stringify({
						statement: search_query,
						database: process.env.NEXT_PUBLIC_SNOWFLAKE_DATABASE,
						schema: process.env.NEXT_PUBLIC_SNOWFLAKE_SCHEMA,
					}),
				}
			)

			const data = await response.json()
			setGlobalSearchOutput(data.data)
		}

		if (access_token && globalSearchInput !== '') {
			searchUserStagesData(access_token)
		}
	}, [globalSearchInput])

	return (
		<div className=''>
			<div className='m-4'>
				<input
					type='text'
					placeholder='Global Search...'
					className='border-2 border-slate-500 rounded-md p-2'
					onChange={(e) => {
						setGlobalSearchInput(e.target.value)
						if (e.target.value === '') {
							setGlobalSearchOutput([])
							return
						}
					}}
				/>
			</div>
			<div className='p-4'>
				{globalSearchOutput && globalSearchOutput.length > 0 ? (
					<table className='w-full'>
						<tbody className='m-4'>
							<tr className='font-bold'>
								<td className='border border-black p-2'>
									Name
								</td>
								<td className='border border-black p-2'>
									Last Modified
								</td>
								<td className='border border-black p-2'>
									Size
								</td>
								<td className='border border-black p-2'>
									Stage
								</td>
							</tr>
							{globalSearchOutput.map((file, index) => {
								return (
									<tr key={index}>
										<td className='border border-black p-2'>
											{file[0]}
										</td>
										<td className='border border-black p-2'>
											{file[2]}
										</td>
										<td className='border border-black p-2'>
											{file[1]}
										</td>
										<td className='border border-black p-2'>
											{file[5]
												.replace('https://', '')
												.split('/')
												.slice(3, 6)
												.join('.')}
										</td>
									</tr>
								)
							})}
						</tbody>
					</table>
				) : null}
			</div>
			<div className='flex flex-col gap-4 m-4'>
				{stages.map((stage, index) => {
					return (
						<div key={index} className='flex gap-4 items-center'>
							<div
								className='flex-grow bg-slate-500 p-4'
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
