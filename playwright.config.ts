import { defineConfig } from '@playwright/test';

const port = Number(process.env.PORT ?? 4173);
const db = `.e2e/${port}.db`;

export default defineConfig({
	testDir: 'e2e',
	use: { baseURL: `http://localhost:${port}` },
	projects: [
		{
			name: 'phone',
			use: { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }
		},
		{
			name: 'desktop',
			use: { viewport: { width: 1280, height: 800 } }
		}
	],
	webServer: {
		command: `mkdir -p .e2e && rm -f ${db} && node build`,
		port,
		reuseExistingServer: false,
		env: { PORT: String(port), DATABASE_PATH: db }
	}
});
