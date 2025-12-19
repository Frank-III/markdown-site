<script lang="ts">
	import { format, parseISO } from 'date-fns';

	interface Post {
		_id: string;
		slug: string;
		title: string;
		description: string;
		date: string;
		readTime?: string;
		tags: string[];
	}

	let { posts }: { posts: Post[] } = $props();

	// Sort posts by date descending and group by year
	function groupByYear(posts: Post[]): Record<string, Post[]> {
		const sorted = [...posts].sort(
			(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
		);

		return sorted.reduce(
			(acc, post) => {
				const year = post.date.substring(0, 4);
				if (!acc[year]) {
					acc[year] = [];
				}
				acc[year].push(post);
				return acc;
			},
			{} as Record<string, Post[]>
		);
	}

	const groupedPosts = $derived(groupByYear(posts));
	const years = $derived(Object.keys(groupedPosts).sort((a, b) => Number(b) - Number(a)));
</script>

<div class="post-list">
	{#each years as year}
		<div class="post-year-group">
			<h2 class="year-heading">{year}</h2>
			<ul class="posts">
				{#each groupedPosts[year] as post}
					<li class="post-item">
						<a href="/{post.slug}" class="post-link">
							<span class="post-title">{post.title}</span>
							<span class="post-meta">
								{#if post.readTime}
									<span class="post-read-time">{post.readTime}</span>
								{/if}
								<span class="post-date">
									{format(parseISO(post.date), 'MMMM d')}
								</span>
							</span>
						</a>
					</li>
				{/each}
			</ul>
		</div>
	{/each}
</div>
