import { browser } from '$app/environment';

const SESSION_ID_KEY = 'markdown_blog_session_id';
const HEARTBEAT_INTERVAL_MS = 30 * 1000;
const HEARTBEAT_DEBOUNCE_MS = 5 * 1000;

function generateSessionId(): string {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		const v = c === 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

export function getSessionId(): string {
	if (!browser) {
		return generateSessionId();
	}

	let sessionId = localStorage.getItem(SESSION_ID_KEY);
	if (!sessionId) {
		sessionId = generateSessionId();
		localStorage.setItem(SESSION_ID_KEY, sessionId);
	}
	return sessionId;
}

export function getPageType(path: string): string {
	if (path === '/' || path === '') {
		return 'home';
	}
	if (path === '/stats') {
		return 'stats';
	}
	return 'page';
}

// Track heartbeat state
let isHeartbeatPending = false;
let lastHeartbeatTime = 0;
let lastHeartbeatPath: string | null = null;
let heartbeatInterval: ReturnType<typeof setInterval> | null = null;

export function createPageTracker(
	recordPageView: (args: { path: string; pageType: string; sessionId: string }) => Promise<void>,
	heartbeat: (args: { sessionId: string; currentPath: string }) => Promise<void>
) {
	let lastRecordedPath: string | null = null;

	async function sendHeartbeat(path: string) {
		const sessionId = getSessionId();
		const now = Date.now();

		if (isHeartbeatPending) return;
		if (lastHeartbeatPath === path && now - lastHeartbeatTime < HEARTBEAT_DEBOUNCE_MS) return;

		isHeartbeatPending = true;
		lastHeartbeatTime = now;
		lastHeartbeatPath = path;

		try {
			await heartbeat({ sessionId, currentPath: path });
		} catch {
			// Silently fail
		} finally {
			isHeartbeatPending = false;
		}
	}

	function track(path: string) {
		const sessionId = getSessionId();

		// Record page view if path changed
		if (lastRecordedPath !== path) {
			lastRecordedPath = path;
			recordPageView({
				path,
				pageType: getPageType(path),
				sessionId
			}).catch(() => {
				// Silently fail
			});
		}

		// Send initial heartbeat
		sendHeartbeat(path);

		// Clear existing interval
		if (heartbeatInterval) {
			clearInterval(heartbeatInterval);
		}

		// Set up interval for ongoing heartbeats
		heartbeatInterval = setInterval(() => {
			sendHeartbeat(path);
		}, HEARTBEAT_INTERVAL_MS);
	}

	function cleanup() {
		if (heartbeatInterval) {
			clearInterval(heartbeatInterval);
			heartbeatInterval = null;
		}
	}

	return { track, cleanup };
}
