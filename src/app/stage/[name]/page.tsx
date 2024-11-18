'use client'
import { redirect, useParams, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

type Stage = {
	name: string
}

type StageFile = {
	name: string
	last_modified: string
	file_type: 'FILE' | 'DIRECTORY'
	size: number
}

function FilesTable({
	stages,
	stage,
	accessToken,
	file,
}: {
	stages: Stage[]
	stage: Stage
	accessToken: string
	file: StageFile
}) {
	const [copyToStage, setCopyToStage] = useState<string>(stages[0].name)
	const [preview, setPreview] = useState<string>()
	return (
		<tr>
			<td className='border border-black p-2'>
				{file.file_type === 'DIRECTORY' ? (
					<button
						type='button'
						className='text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700'
						onClick={async () => {
							redirect(`/stage/${stage.name}?folder=${file.name}`)
						}}>
						{file.name.replace(stage.name.toLowerCase() + '/', '')}
					</button>
				) : (
					file.name.replace(stage.name.toLowerCase() + '/', '')
				)}
			</td>
			<td className='border border-black p-2'>{file.last_modified}</td>
			<td className='border border-black p-2'>{file.size}</td>
			<td className='border border-black p-2'>
				<button
					type='button'
					className='text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700'
					onClick={async () => {
						const download_response = await fetch(
							`https://${process.env.NEXT_PUBLIC_SNOWFLAKE_ACCOUNT_URL}/api/v2/statements`,
							{
								method: 'POST',
								headers: {
									'Content-Type': 'application/json',
									Authorization: `Bearer ${accessToken}`,
									'X-Snowflake-Authorization-Token-Type':
										'OAUTH',
								},
								body: JSON.stringify({
									statement: `SELECT GET_PRESIGNED_URL(@${
										stage.name
									}, '${file.name.replace(
										stage.name.toLowerCase() + '/',
										''
									)}', 3600);`,
									database: process.env.NEXT_PUBLIC_SNOWFLAKE_DATABASE,
									schema: process.env.NEXT_PUBLIC_SNOWFLAKE_SCHEMA,
								}),
							}
						)

						const download_data = (await download_response.json())
							.data
						console.log(download_data[0][0])
						window.open(
							download_data[0][0],
							'_blank',
							'noopener,noreferrer'
						)
					}}>
					Download
				</button>
				<button
					type='button'
					className='text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700'
					onClick={async () => {
						const download_response = await fetch(
							`https://${process.env.NEXT_PUBLIC_SNOWFLAKE_ACCOUNT_URL}/api/v2/statements`,
							{
								method: 'POST',
								headers: {
									'Content-Type': 'application/json',
									Authorization: `Bearer ${accessToken}`,
									'X-Snowflake-Authorization-Token-Type':
										'OAUTH',
								},
								body: JSON.stringify({
									statement: `SELECT GET_PRESIGNED_URL(@${
										stage.name
									}, '${file.name.replace(
										stage.name.toLowerCase() + '/',
										''
									)}', 3600);`,
									database: process.env.NEXT_PUBLIC_SNOWFLAKE_DATABASE,
									schema: process.env.NEXT_PUBLIC_SNOWFLAKE_SCHEMA,
								}),
							}
						)

						const download_data = await download_response.json()
						setPreview(download_data.data[0][0] as string)
					}}>
					Preview
				</button>
				<button
					type='button'
					className='text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700'
					onClick={async () => {
						await fetch(
							`https://${process.env.NEXT_PUBLIC_SNOWFLAKE_ACCOUNT_URL}/api/v2/statements`,
							{
								method: 'POST',
								headers: {
									'Content-Type': 'application/json',
									Authorization: `Bearer ${accessToken}`,
									'X-Snowflake-Authorization-Token-Type':
										'OAUTH',
								},
								body: JSON.stringify({
									statement: `REMOVE @${file.name}`,
									database: process.env.NEXT_PUBLIC_SNOWFLAKE_DATABASE,
									schema: process.env.NEXT_PUBLIC_SNOWFLAKE_SCHEMA,
								}),
							}
						)

						window.location.reload()
					}}>
					Delete
				</button>
				<select
					id='countries'
					className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 me-2 mb-2'
					onChange={(e) => {
						console.log(e.target.value)
						setCopyToStage(e.target.value)
					}}>
					{stages.map((stage, index) => {
						return (
							<option key={index} value={stage.name}>
								{stage.name}
							</option>
						)
					})}
				</select>
				<button
					type='button'
					className='text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700'
					onClick={async () => {
						const copy_response = await fetch(
							`https://${process.env.NEXT_PUBLIC_SNOWFLAKE_ACCOUNT_URL}/api/v2/statements`,
							{
								method: 'POST',
								headers: {
									'Content-Type': 'application/json',
									Authorization: `Bearer ${accessToken}`,
									'X-Snowflake-Authorization-Token-Type':
										'OAUTH',
								},
								body: JSON.stringify({
									statement: `COPY FILES INTO @${copyToStage} FROM @${file.name}`,
									database: process.env.NEXT_PUBLIC_SNOWFLAKE_DATABASE,
									schema: process.env.NEXT_PUBLIC_SNOWFLAKE_SCHEMA,
								}),
							}
						)

						const copy_data = await copy_response.json()
						console.log(copy_data)
					}}>
					Copy
				</button>
			</td>
			<td className='border border-black p-2'>
				{file.name.endsWith('.png') ||
				file.name.endsWith('.jpg') ||
				file.name.endsWith('.jpeg') ||
				file.name.endsWith('.gif')
					? preview && (
							<img
								src={preview}
								alt={file.name}
								width={300}
								height={300}
							/>
					  )
					: preview && (
							<iframe
								src={`/api/preview?url=${encodeURIComponent(
									preview
								)}`}
								width='300'
								height='300'></iframe>
					  )}
			</td>
		</tr>
	)
}

export default function StageView() {
	const [files, setFiles] = useState<FileList>()
	const [ftpUrl, setFtpUrl] = useState<string>()
	const [accessToken, setAccessToken] = useState<string>()
	const [stage, setStage] = useState<Stage>()
	const [stages, setStages] = useState<Stage[]>([])
	const [stageFiles, setStageFiles] = useState<StageFile[]>([])
	const [filteredStageFiles, setFilteredStageFiles] = useState<StageFile[]>(
		[]
	)
	const params = useParams()
	const searchParams = useSearchParams()
	const folderParam = searchParams.get('folder')

	useEffect(() => {
		const access_token = window.localStorage.getItem('access_token')
		const refresh_token = window.localStorage.getItem('refresh_token')
		const token_type = window.localStorage.getItem('token_type')

		if (access_token && refresh_token && token_type) {
			console.log('token is valid')
			setAccessToken(access_token)
		} else {
			console.log('token is invalid')
			redirect('/login')
		}

		async function getUserStages(access_token: string) {
			const stage_response = await fetch(
				`https://${process.env.NEXT_PUBLIC_SNOWFLAKE_ACCOUNT_URL}/api/v2/databases/${process.env.NEXT_PUBLIC_SNOWFLAKE_DATABASE}/schemas/${process.env.NEXT_PUBLIC_SNOWFLAKE_SCHEMA}/stages?like=${params.name}`,
				{
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${access_token}`,
						'X-Snowflake-Authorization-Token-Type': 'OAUTH',
					},
				}
			)
			if (stage_response.status === 401) {
				const token_response = await fetch(
					`${process.env.NEXT_PUBLIC_BACKEND_PROXY_URL}/api/tokens`,
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
				setAccessToken(token_data.access_token)
			} else if (stage_response.status === 200) {
				const data = await stage_response.json()
				setStage(data[0])
				console.log(data)
			}

			const stages_response = await fetch(
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
			if (stages_response.status === 200) {
				const data = await stages_response.json()
				setStages(data)
			}

			const stage_files_url =
				folderParam === null
					? `https://${process.env.NEXT_PUBLIC_SNOWFLAKE_ACCOUNT_URL}/api/v2/databases/${process.env.NEXT_PUBLIC_SNOWFLAKE_DATABASE}/schemas/${process.env.NEXT_PUBLIC_SNOWFLAKE_SCHEMA}/stages/${params.name}/files`
					: `https://${process.env.NEXT_PUBLIC_SNOWFLAKE_ACCOUNT_URL}/api/v2/databases/${process.env.NEXT_PUBLIC_SNOWFLAKE_DATABASE}/schemas/${process.env.NEXT_PUBLIC_SNOWFLAKE_SCHEMA}/stages/${params.name}/files?pattern=.*${folderParam}.*`

			const stage_files_response = await fetch(stage_files_url, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${access_token}`,
					'X-Snowflake-Authorization-Token-Type': 'OAUTH',
				},
			})

			if (stage_files_response.status === 200) {
				const data = await stage_files_response.json()
				console.log('data' + data)
				const folders: StageFile[] = []

				data.filter((file: StageFile) => {
					return file.name.split('/').length > 2
				})

				data.map((file: StageFile) => {
					console.log(file)
					if (file.name.replace('', '').split('/').length > 2) {
						const folder = file.name.split('/')[1]
						let folderExists = false
						for (let i = 0; i < folders.length; i++) {
							if (folders[i].name === folder) {
								folderExists = true
								break
							}
						}
						if (!folderExists) {
							folders.push({
								name: folder,
								last_modified: file.last_modified,
								size: file.size,
								file_type: 'DIRECTORY',
							})
						}
					}
				})

				setStageFiles(
					data
						.filter((file: StageFile) => {
							return !(file.name.split('/').length > 2)
						})
						.concat(folders)
				)

				console.log(data)
			}
		}

		getUserStages(access_token)
	}, [])

	return (
		<div>
			<div className='flex gap-4 items-center p-6'>
				<div className='flex-grow'>{stage && stage.name}</div>
				<input
					type='file'
					multiple
					onChange={(e) => {
						if (!e.target.files) return
						setFiles(e.target.files)
					}}
				/>
				<input
					type='text'
					placeholder='Ftp URL'
					className='border-black border-2 border-solid rounded-md p-2'
					onChange={(e) => {
						if (!e.target.value || e.target.value == '')
							setFtpUrl(undefined)
						setFtpUrl(e.target.value)
					}}
				/>
				<button
					onClick={async () => {
						console.log(files?.length)
						if (
							(files === undefined || files.length === 0) &&
							ftpUrl === undefined
						)
							return
						if (params.name === undefined) return

						const formData = new FormData()
						formData.append('stage', params.name.toString())
						if (ftpUrl !== undefined) {
							formData.append('ftpUrl', ftpUrl)
						} else if (files !== undefined) {
							formData.append('file', files[0])
						}

						await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/upload`, {
							method: 'POST',
							headers: {
								Authorization: `Bearer ${accessToken}`,
							},
							body: formData,
						})
					}}>
					Upload
				</button>
				<button>Delete</button>
			</div>
			<div className='flex flex-row gap-4 p-6'>
				<input
					type='text'
					placeholder='Search'
					className='border-black border-2 border-solid rounded-md p-2'
					onChange={(e) => {
						if (!e.target.value || e.target.value == '')
							setFilteredStageFiles([])

						setFilteredStageFiles(
							stageFiles.filter((stageFile) => {
								return stageFile.name
									.toLowerCase()
									.includes(e.target.value.toLowerCase())
							})
						)
					}}
				/>
			</div>
			<div className=''>
				{stageFiles && (
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
									Actions
								</td>
								<td className='border border-black p-2'>
									Preview
								</td>
							</tr>
							{filteredStageFiles.length == 0 && stage &&
								stageFiles.map((file, index) => {
									return (
										<FilesTable
											key={index}
											accessToken={accessToken!}
											file={file}
											stages={stages}
											stage={stage}
										/>
									)
								})}
							{filteredStageFiles && stage &&
								filteredStageFiles.length > 0 &&
								filteredStageFiles.map((file, index) => {
									return (
										<FilesTable
											key={index}
											accessToken={accessToken!}
											file={file}
											stages={stages}
											stage={stage}
										/>
									)
								})}
						</tbody>
					</table>
				)}
			</div>
		</div>
	)
}
