import type { Page } from '@playwright/test';

// filled by U7; seeds its own state
export async function walk(page: Page, check: (slug: string) => Promise<void>) {}
