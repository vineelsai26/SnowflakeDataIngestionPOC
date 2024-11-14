export async function POST(request: Request) {
	const { code, grant_type, redirect_url, redirect_url_protocol, refresh_token } =
		await request.json()

	const myHeaders = new Headers()
	myHeaders.append('Content-Type', 'application/x-www-form-urlencoded')
	myHeaders.append(
		'Authorization',
		'Basic ' +
			btoa(
				`${process.env.NEXT_PUBLIC_SNOWFLAKE_CLIENT_ID}:${process.env.NEXT_SNOWFLAKE_CLIENT_SECRET}`
			)
	)

    const urlencoded = new URLSearchParams()

    if (grant_type === 'refresh_token'){
        urlencoded.append('grant_type', 'refresh_token')
        urlencoded.append('refresh_token', refresh_token)
    } else {
        urlencoded.append('grant_type', 'authorization_code')
        urlencoded.append('code', code)
    }

	urlencoded.append(
		'redirect_uri',
		`${redirect_url_protocol}//${redirect_url}/login`
	)

	const requestOptions = {
		method: 'POST',
		headers: myHeaders,
		body: urlencoded,
	}

	const response = await fetch(
		`https://${process.env.NEXT_PUBLIC_SNOWFLAKE_ACCOUNT_URL}/oauth/token-request`,
		requestOptions
	)
	const data = await response.json()

	return new Response(JSON.stringify(data), {
		status: 200,
		headers: { 'Content-Type': 'application/json' },
	})
}
