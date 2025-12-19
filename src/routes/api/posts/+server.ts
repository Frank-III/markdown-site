import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '$convex/_generated/api';

const CONVEX_URL = process.env.VITE_CONVEX_URL || '';

export const GET: RequestHandler = async ({ url }) => {
	const client = new ConvexHttpClient(CONVEX_URL);
	const posts = await client.query(api.posts.getAllPosts, {});

	const search = url.searchParams.get('q')?.toLowerCase();

	let filteredPosts = posts;
	if (search) {
		filteredPosts = posts.filter(
			(post) =>
				post.title.toLowerCase().includes(search) ||
				post.description.toLowerCase().includes(search) ||
				post.tags.some((tag) => tag.toLowerCase().includes(search))
		);
	}

	return json(filteredPosts);
};
