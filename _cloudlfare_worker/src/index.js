import Micropub from '@benjifs/micropub'
import GitHubStore from '@benjifs/github-store'

// Custom front matter fields to inject
const CUSTOM_FRONT_MATTER = `navigation: true
class: post-template
layout: post
current: post
`

// UTF-8 safe base64 encoding/decoding
function base64Decode(str) {
	const bytes = Uint8Array.from(atob(str), c => c.charCodeAt(0))
	return new TextDecoder().decode(bytes)
}

function base64Encode(str) {
	const bytes = new TextEncoder().encode(str)
	return btoa(String.fromCharCode(...bytes))
}

// Initialize micropub instance with environment variables
function getMicropub(env) {
	const store = new GitHubStore({
		token: env.GITHUB_TOKEN,
		user: env.GITHUB_USER,
		repo: env.GITHUB_REPO,
	})

	// Fix GitHub API compatibility for Cloudflare Workers
	// AND inject custom front matter into markdown files
	const originalFetch = globalThis.fetch
	globalThis.fetch = async function(url, options = {}) {
		if (url && url.includes('api.github.com')) {
			// Decode URL-encoded slashes
			let fixedUrl = url.replace(/%2F/g, '/')
			
			// Add required User-Agent header
			const headers = options.headers || {}
			if (!headers['User-Agent'] && !headers['user-agent']) {
				headers['User-Agent'] = 'Micropub-Cloudflare-Worker/1.0'
			}
			
			// Intercept PUT/POST requests to inject custom front matter
			if ((options.method === 'PUT' || options.method === 'POST') && options.body) {
				try {
					const requestBody = JSON.parse(options.body)
					if (requestBody.content) {
						const decoded = base64Decode(requestBody.content)
						
						// Check if it has front matter and hasn't already been processed
						if (decoded.startsWith('---') && !decoded.includes('navigation: true')) {
							// Find the end of front matter
							const endOfFrontMatter = decoded.indexOf('\n---', 3)
							
							let modifiedContent
							if (endOfFrontMatter === -1) {
								// No closing ---, just inject custom fields
								modifiedContent = decoded.replace(
									/^---\n/,
									`---\n${CUSTOM_FRONT_MATTER}`
								)
							} else {
								let frontMatter = decoded.substring(0, endOfFrontMatter)
								let postBody = decoded.substring(endOfFrontMatter + 4) // +4 to skip \n---
								
								// Extract first image only if it's the first content after front matter
								// Matches: ![alt](url) or ![](url) at the start (allowing whitespace)
								const imgRegex = /^\s*!\[[^\]]*\]\(([^)]+)\)/
								const imgMatch = postBody.match(imgRegex)
								
								let coverField = ''
								if (imgMatch) {
									const imgUrl = imgMatch[1]
									coverField = `cover: ${imgUrl}\n`
									// Remove only the matched image (imgMatch[0] is the full match)
									postBody = postBody.replace(imgMatch[0], '').replace(/^\n+/, '\n')
								}
								
								// Rebuild with custom front matter and cover
								modifiedContent = frontMatter.replace(
									/^---\n/,
									`---\n${CUSTOM_FRONT_MATTER}${coverField}`
								) + '\n---' + postBody
							}
							// Re-encode (UTF-8 safe) and update the request body
							requestBody.content = base64Encode(modifiedContent)
							options.body = JSON.stringify(requestBody)
						}
					}
				} catch (e) {
					// If parsing fails, continue with original body
					console.error('Failed to inject front matter:', e)
				}
			}
			
			return originalFetch(fixedUrl, { ...options, headers })
		}
		
		return originalFetch(url, options)
	}

	return new Micropub({
		store,
		me: env.ME,
		tokenEndpoint: env.TOKEN_ENDPOINT,
		contentDir: '_drafts',
		mediaDir: 'images/posts',
		config: {},
		formatSlug: (type, filename) => {
			// Add date prefix if not already present (Jekyll requirement: YYYY-MM-DD-title.md)
			if (!/^\d{4}-\d{2}-\d{2}-.+/.test(filename)) {
				const today = new Date()
				const datePrefix = today.toISOString().split('T')[0] + '-'
				return datePrefix + filename
			}
			return filename
		}
	})
}

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url)
		const micropub = getMicropub(env)

		try {
			// Route based on pathname
			if (url.pathname === '/media' || url.pathname === '/media/') {
				return await micropub.mediaHandler(request)
			} else if (url.pathname === '/micropub' || url.pathname === '/micropub/') {
				const q = url.searchParams.get('q')
				
				// Handle unauthenticated config queries
				if (q === 'config') {
					return new Response(
						JSON.stringify({
							'media-endpoint': 'https://micropub.colin-c77.workers.dev/media',
						}),
						{
							status: 200,
							headers: { 
								'Content-Type': 'application/json',
								'Access-Control-Allow-Origin': '*'
							}
						}
					)
				}
				
				return await micropub.micropubHandler(request)
			}

			// Handle root path or 404
			return new Response('Not Found', { status: 404 })
		} catch (error) {
			console.error('Error:', error)
			return new Response(
				JSON.stringify({ 
					error: 'internal_server_error',
					error_description: error.message 
				}),
				{
					status: 500,
					headers: { 'Content-Type': 'application/json' }
				}
			)
		}
	}
}