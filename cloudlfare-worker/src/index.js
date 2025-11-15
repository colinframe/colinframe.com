import Micropub from '@benjifs/micropub'
import GitHubStore from '@benjifs/github-store'

// Initialize micropub instance with environment variables
function getMicropub(env) {
	const store = new GitHubStore({
		token: env.GITHUB_TOKEN,
		user: env.GITHUB_USER,
		repo: env.GITHUB_REPO,
	})

	return new Micropub({
		store,
		me: env.ME,
		tokenEndpoint: env.TOKEN_ENDPOINT,
		// contentDir: 'src',
		// mediaDir: 'uploads',
		// https://micropub.spec.indieweb.org/#configuration
		config: {
			// 'media-endpoint': 'https://your-worker.workers.dev/media',
			// 'syndicate-to': [
			// 	{ uid: 'https://fed.brid.gy/', name: 'w/ Bridgy Fed', checked: true },
			// ],
			// 'post-types': [
			// 	{ type: 'note', name: 'Note' },
			// 	{ type: 'photo', name: 'Photo' },
			// 	{ type: 'reply', name: 'Reply' },
			// 	{ type: 'bookmark', name: 'Bookmark' },
			// 	{ type: 'like', name: 'Like' },
			// 	{ type: 'article', name: 'Article' },
			// 	{ type: 'rsvp', name: 'RSVP' },
			// 	{ type: 'repost', name: 'Repost' },
			// 	{ type: 'watch', name: 'Watch' },
			// 	{ type: 'read', name: 'Read' },
			// 	{ type: 'listen', name: 'Listen' },
			// 	{ type: 'game', name: 'Game' },
			// ],
		},
		// formatSlug: (type, filename) => {
		// 	const typeToSlug = {
		// 		like: 'likes',
		// 		bookmark: 'bookmarks',
		// 		rsvp: 'rsvp',
		// 		article: 'articles',
		// 		watch: 'watched',
		// 		read: 'read',
		// 		listen: 'listen',
		// 		play: 'play'
		// 	}
		// 	return `${typeToSlug[type] || 'notes'}/${filename}`
		// },
	})
}

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url)
		const micropub = getMicropub(env)

		// Route based on pathname
		if (url.pathname === '/media' || url.pathname === '/media/') {
			return await micropub.mediaHandler(request)
		} else if (url.pathname === '/micropub' || url.pathname === '/micropub/') {
			return await micropub.micropubHandler(request)
		}

		// Handle root path or 404
		return new Response('Not Found', { status: 404 })
	}
}