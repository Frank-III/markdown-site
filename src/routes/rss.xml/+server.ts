import type { RequestHandler } from './$types';

const SITE_URL = 'https://markdown-site.fly.dev';
const SITE_NAME = 'Markdown Site';
const SITE_DESCRIPTION = 'A markdown-powered blog';

export const GET: RequestHandler = async ({ fetch }) => {
	// Fetch posts from Convex via the API
	const response = await fetch('/api/posts');
	const posts = await response.json();

	const rssItems = posts
		.map(
			(post: { slug: string; title: string; description: string; date: string }) => `
		<item>
			<title><![CDATA[${post.title}]]></title>
			<link>${SITE_URL}/${post.slug}</link>
			<guid isPermaLink="true">${SITE_URL}/${post.slug}</guid>
			<description><![CDATA[${post.description}]]></description>
			<pubDate>${new Date(post.date).toUTCString()}</pubDate>
		</item>`
		)
		.join('');

	const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
	<channel>
		<title>${SITE_NAME}</title>
		<link>${SITE_URL}</link>
		<description>${SITE_DESCRIPTION}</description>
		<language>en-us</language>
		<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
		<atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
		${rssItems}
	</channel>
</rss>`;

	return new Response(rss.trim(), {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=3600'
		}
	});
};
