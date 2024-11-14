import { type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams
    const previewUrl = searchParams.get('url')?.toString()

    console.log(previewUrl)

    if (!previewUrl) {
        return new Response(JSON.stringify({ error: 'No preview URL provided' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    if (!previewUrl.startsWith('https://')) {
        return new Response(JSON.stringify({ error: 'Invalid preview URL' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    const content_response = await fetch(previewUrl)

    const content = await content_response.blob()

	return new Response(content, {
		status: 200,
		headers: { 'Content-Type': 'text/plain' },
	})
}
