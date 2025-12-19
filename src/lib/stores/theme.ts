import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'dark' | 'light' | 'tan' | 'cloud';

const DEFAULT_THEME: Theme = 'tan';

// Theme color values for meta tag
const themeColors: Record<Theme, string> = {
	dark: '#111111',
	light: '#ffffff',
	tan: '#faf8f5',
	cloud: '#f5f5f5'
};

function getInitialTheme(): Theme {
	if (!browser) return DEFAULT_THEME;

	try {
		const saved = localStorage.getItem('blog-theme') as Theme;
		if (saved && ['dark', 'light', 'tan', 'cloud'].includes(saved)) {
			return saved;
		}
	} catch {
		// localStorage not available
	}
	return DEFAULT_THEME;
}

function createThemeStore() {
	const { subscribe, set, update } = writable<Theme>(getInitialTheme());

	return {
		subscribe,
		set: (theme: Theme) => {
			set(theme);
			if (browser) {
				localStorage.setItem('blog-theme', theme);
				document.documentElement.setAttribute('data-theme', theme);
				// Update meta theme-color
				const metaThemeColor = document.querySelector('meta[name="theme-color"]');
				if (metaThemeColor) {
					metaThemeColor.setAttribute('content', themeColors[theme]);
				}
			}
		},
		toggle: () => {
			update((current) => {
				const themes: Theme[] = ['dark', 'light', 'tan', 'cloud'];
				const currentIndex = themes.indexOf(current);
				const nextIndex = (currentIndex + 1) % themes.length;
				const newTheme = themes[nextIndex];

				if (browser) {
					localStorage.setItem('blog-theme', newTheme);
					document.documentElement.setAttribute('data-theme', newTheme);
					const metaThemeColor = document.querySelector('meta[name="theme-color"]');
					if (metaThemeColor) {
						metaThemeColor.setAttribute('content', themeColors[newTheme]);
					}
				}

				return newTheme;
			});
		}
	};
}

export const theme = createThemeStore();
