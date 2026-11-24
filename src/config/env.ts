import 'dotenv/config';

const baseUrl = (process.env.BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '');

export const config = {
  baseUrl,
  apiUrl: `${baseUrl}/api`,
  adminEmail: process.env.ADMIN_EMAIL ?? 'admin@azurian.com',
  adminPassword: process.env.ADMIN_PASSWORD ?? 'Azurian2026!',
  headless: process.env.HEADED !== 'true',
  runIdStorageKey: 'azurian_lab_run_id',
  timeoutMs: 15_000,
} as const;
